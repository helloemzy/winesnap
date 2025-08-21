// Real-time subscriptions for social features

import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import type { RealtimeChannel, RealtimePostgresChangesPayload } from '@supabase/supabase-js'

export interface ActivityFeedItem {
  id: string
  user_id: string
  activity_type: 'wine_entry' | 'collection_created' | 'follow' | 'like' | 'comment'
  target_id: string | null
  target_user_id: string | null
  metadata: any
  created_at: string
  profiles: {
    username: string
    display_name: string | null
    avatar_url: string | null
  } | null
  target_user: {
    username: string
    display_name: string | null
    avatar_url: string | null
  } | null
}

export interface NotificationItem {
  id: string
  type: 'like' | 'comment' | 'follow' | 'wine_shared'
  message: string
  from_user: {
    username: string
    display_name: string | null
    avatar_url: string | null
  }
  target_id?: string
  created_at: string
  read: boolean
}

// Real-time activity feed hook
export function useActivityFeed() {
  const [activities, setActivities] = useState<ActivityFeedItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadActivities = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setError('Authentication required')
        return
      }

      // Load initial activity feed
      const { data, error: fetchError } = await supabase
        .from('activity_feed')
        .select(`
          *,
          profiles!activity_feed_user_id_fkey(username, display_name, avatar_url),
          target_user:profiles!activity_feed_target_user_id_fkey(username, display_name, avatar_url)
        `)
        .or(`user_id.eq.${user.id},user_id.in.(select following_id from user_follows where follower_id = '${user.id}')`)
        .order('created_at', { ascending: false })
        .limit(50)

      if (fetchError) {
        setError(fetchError.message)
        return
      }

      setActivities(data || [])
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadActivities()
  }, [loadActivities])

  // Set up real-time subscription
  useEffect(() => {
    let channel: RealtimeChannel

    const setupSubscription = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      channel = supabase
        .channel('activity_feed_changes')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'activity_feed'
          },
          (payload: RealtimePostgresChangesPayload<any>) => {
            console.log('New activity:', payload.new)
            
            // Add the new activity to the feed
            setActivities(prev => {
              // Check if this activity should be visible to current user
              const newActivity = payload.new
              if (newActivity.user_id === user.id) {
                // User's own activity
                return [newActivity, ...prev]
              }
              
              // Would need to check if user follows this person
              // For now, assume it should be visible
              return [newActivity, ...prev].slice(0, 50) // Keep only 50 most recent
            })
          }
        )
        .subscribe()
    }

    setupSubscription()

    return () => {
      if (channel) {
        supabase.removeChannel(channel)
      }
    }
  }, [])

  return {
    activities,
    loading,
    error,
    refresh: loadActivities
  }
}

// Real-time notifications hook
export function useNotifications() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadNotifications = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        // Simulate notifications from activity feed
        const { data: activities } = await supabase
          .from('activity_feed')
          .select(`
            *,
            profiles!activity_feed_user_id_fkey(username, display_name, avatar_url)
          `)
          .eq('target_user_id', user.id) // Activities targeting this user
          .order('created_at', { ascending: false })
          .limit(20)

        if (activities) {
          const notifications = activities.map(activity => ({
            id: activity.id,
            type: activity.activity_type as any,
            message: generateNotificationMessage(activity),
            from_user: activity.profiles,
            target_id: activity.target_id,
            created_at: activity.created_at,
            read: false // Would need separate table for read status
          }))

          setNotifications(notifications)
          setUnreadCount(notifications.length)
        }
      } catch (error) {
        console.error('Failed to load notifications:', error)
      } finally {
        setLoading(false)
      }
    }

    loadNotifications()

    // Set up real-time subscription for new notifications
    const channel = supabase
      .channel('notification_changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'activity_feed'
        },
        async (payload: RealtimePostgresChangesPayload<any>) => {
          const { data: { user } } = await supabase.auth.getUser()
          if (!user || payload.new.target_user_id !== user.id) return

          // Fetch the profile data for the notification
          const { data: profile } = await supabase
            .from('profiles')
            .select('username, display_name, avatar_url')
            .eq('id', payload.new.user_id)
            .single()

          const newNotification: NotificationItem = {
            id: payload.new.id,
            type: payload.new.activity_type,
            message: generateNotificationMessage(payload.new),
            from_user: profile,
            target_id: payload.new.target_id,
            created_at: payload.new.created_at,
            read: false
          }

          setNotifications(prev => [newNotification, ...prev])
          setUnreadCount(prev => prev + 1)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const markAsRead = (notificationId: string) => {
    setNotifications(prev =>
      prev.map(notif =>
        notif.id === notificationId ? { ...notif, read: true } : notif
      )
    )
    setUnreadCount(prev => Math.max(0, prev - 1))
  }

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(notif => ({ ...notif, read: true })))
    setUnreadCount(0)
  }

  return {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead
  }
}

function generateNotificationMessage(activity: any): string {
  const username = activity.profiles?.display_name || activity.profiles?.username || 'Someone'
  
  switch (activity.activity_type) {
    case 'follow':
      return `${username} started following you`
    case 'like':
      return `${username} liked your wine`
    case 'comment':
      return `${username} commented on your wine`
    case 'wine_entry':
      return `${username} added a new wine`
    default:
      return `${username} interacted with your content`
  }
}

// Real-time wine updates hook (for specific wine page)
export function useWineUpdates(wineId: string) {
  const [likes, setLikes] = useState<number>(0)
  const [comments, setComments] = useState<any[]>([])

  useEffect(() => {
    if (!wineId) return

    // Load initial data
    const loadWineData = async () => {
      const { data: wineData } = await supabase
        .from('wine_entries')
        .select(`
          wine_entry_likes(id),
          wine_entry_comments(id, content, created_at, profiles(username, display_name, avatar_url))
        `)
        .eq('id', wineId)
        .single()

      if (wineData) {
        setLikes(wineData.wine_entry_likes?.length || 0)
        setComments(wineData.wine_entry_comments || [])
      }
    }

    loadWineData()

    // Set up real-time subscriptions
    const likesChannel = supabase
      .channel(`wine_likes_${wineId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'wine_entry_likes',
          filter: `wine_entry_id=eq.${wineId}`
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setLikes(prev => prev + 1)
          } else if (payload.eventType === 'DELETE') {
            setLikes(prev => Math.max(0, prev - 1))
          }
        }
      )
      .subscribe()

    const commentsChannel = supabase
      .channel(`wine_comments_${wineId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'wine_entry_comments',
          filter: `wine_entry_id=eq.${wineId}`
        },
        async (payload) => {
          // Fetch the comment with profile data
          const { data: comment } = await supabase
            .from('wine_entry_comments')
            .select('*, profiles(username, display_name, avatar_url)')
            .eq('id', payload.new.id)
            .single()

          if (comment) {
            setComments(prev => [comment, ...prev])
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(likesChannel)
      supabase.removeChannel(commentsChannel)
    }
  }, [wineId])

  return { likes, comments }
}

// User follow management
export function useFollowManager() {
  const [following, setFollowing] = useState<Set<string>>(new Set())
  const [followers, setFollowers] = useState<Set<string>>(new Set())

  useEffect(() => {
    const loadFollowData = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Load who user is following
      const { data: followingData } = await supabase
        .from('user_follows')
        .select('following_id')
        .eq('follower_id', user.id)

      // Load who follows this user
      const { data: followersData } = await supabase
        .from('user_follows')
        .select('follower_id')
        .eq('following_id', user.id)

      setFollowing(new Set(followingData?.map(f => f.following_id) || []))
      setFollowers(new Set(followersData?.map(f => f.follower_id) || []))
    }

    loadFollowData()

    // Real-time updates for follows
    const { data: { user } } = supabase.auth.getUser()
    user.then(({ data: { user } }) => {
      if (!user) return

      const channel = supabase
        .channel('follow_changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'user_follows',
            filter: `or(follower_id.eq.${user.id},following_id.eq.${user.id})`
          },
          (payload) => {
            if (payload.eventType === 'INSERT') {
              if (payload.new.follower_id === user.id) {
                setFollowing(prev => new Set([...prev, payload.new.following_id]))
              }
              if (payload.new.following_id === user.id) {
                setFollowers(prev => new Set([...prev, payload.new.follower_id]))
              }
            } else if (payload.eventType === 'DELETE') {
              if (payload.old.follower_id === user.id) {
                setFollowing(prev => {
                  const newSet = new Set(prev)
                  newSet.delete(payload.old.following_id)
                  return newSet
                })
              }
              if (payload.old.following_id === user.id) {
                setFollowers(prev => {
                  const newSet = new Set(prev)
                  newSet.delete(payload.old.follower_id)
                  return newSet
                })
              }
            }
          }
        )
        .subscribe()

      return () => {
        supabase.removeChannel(channel)
      }
    })
  }, [])

  const toggleFollow = async (userId: string) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const isFollowing = following.has(userId)

    if (isFollowing) {
      const { error } = await supabase
        .from('user_follows')
        .delete()
        .eq('follower_id', user.id)
        .eq('following_id', userId)

      if (!error) {
        setFollowing(prev => {
          const newSet = new Set(prev)
          newSet.delete(userId)
          return newSet
        })
      }
    } else {
      const { error } = await supabase
        .from('user_follows')
        .insert({
          follower_id: user.id,
          following_id: userId
        })

      if (!error) {
        setFollowing(prev => new Set([...prev, userId]))
      }
    }
  }

  return {
    following: Array.from(following),
    followers: Array.from(followers),
    isFollowing: (userId: string) => following.has(userId),
    toggleFollow
  }
}

export default {
  useActivityFeed,
  useNotifications,
  useWineUpdates,
  useFollowManager
}