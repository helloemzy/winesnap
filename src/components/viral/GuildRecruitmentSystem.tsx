'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  Crown, 
  Shield, 
  Sword,
  Star,
  Trophy,
  Plus,
  Search,
  UserPlus,
  Share2,
  MapPin,
  Award,
  TrendingUp,
  Target,
  Gift,
  ChevronRight,
  Copy,
  ExternalLink,
  MessageCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UserPetWithDetails } from '@/types/pet';

interface Guild {
  id: string;
  name: string;
  description: string;
  guild_type: 'casual' | 'competitive' | 'educational' | 'regional';
  focus_region?: string;
  member_count: number;
  total_guild_experience: number;
  guild_level: number;
  is_public: boolean;
  requires_approval: boolean;
  max_members: number;
  guild_master_id: string;
  guild_master_name: string;
  banner_url?: string;
  color_theme: string;
  created_at: string;
  
  // Viral metrics
  recruitment_bonus: number;
  active_recruiters: number;
  weekly_growth_rate: number;
  competitive_ranking: number;
  
  // Benefits
  member_benefits: {
    discovery_bonus: number;
    battle_support: boolean;
    exclusive_content: boolean;
    experience_multiplier: number;
  };
}

interface GuildMember {
  id: string;
  user_name: string;
  pet_name: string;
  role: 'member' | 'officer' | 'co_leader' | 'leader';
  contribution_score: number;
  joined_at: string;
  last_active_at: string;
  recruitment_count: number;
}

interface RecruitmentCampaign {
  id: string;
  guild_id: string;
  title: string;
  description: string;
  target_members: number;
  current_signups: number;
  recruitment_bonus: number;
  campaign_type: 'open' | 'targeted' | 'event' | 'competitive';
  expires_at: string;
  created_by: string;
  share_link: string;
}

interface GuildRecruitmentSystemProps {
  currentUser: {
    id: string;
    displayName: string;
    guildId?: string;
    guildRole?: string;
  };
  pet: UserPetWithDetails;
  onGuildAction?: (action: string, data: any) => void;
}

const GuildRecruitmentSystem: React.FC<GuildRecruitmentSystemProps> = ({
  currentUser,
  pet,
  onGuildAction
}) => {
  const [currentGuild, setCurrentGuild] = useState<Guild | null>(null);
  const [availableGuilds, setAvailableGuilds] = useState<Guild[]>([]);
  const [guildMembers, setGuildMembers] = useState<GuildMember[]>([]);
  const [recruitmentCampaigns, setRecruitmentCampaigns] = useState<RecruitmentCampaign[]>([]);
  const [createGuildOpen, setCreateGuildOpen] = useState(false);
  const [recruitmentOpen, setRecruitmentOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Mock data
  useEffect(() => {
    const mockGuilds: Guild[] = [
      {
        id: 'guild1',
        name: 'Bordeaux Legends',
        description: 'Elite guild focused on French wine mastery and competitive discovery',
        guild_type: 'competitive',
        focus_region: 'Bordeaux',
        member_count: 47,
        total_guild_experience: 125000,
        guild_level: 15,
        is_public: true,
        requires_approval: true,
        max_members: 100,
        guild_master_id: 'user1',
        guild_master_name: 'VintageViking',
        color_theme: '#7C3AED',
        created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        recruitment_bonus: 150,
        active_recruiters: 8,
        weekly_growth_rate: 12,
        competitive_ranking: 3,
        member_benefits: {
          discovery_bonus: 25,
          battle_support: true,
          exclusive_content: true,
          experience_multiplier: 1.5
        }
      },
      {
        id: 'guild2',
        name: 'Wine Wanderers',
        description: 'Casual exploration guild welcoming all wine enthusiasts',
        guild_type: 'casual',
        member_count: 23,
        total_guild_experience: 45000,
        guild_level: 8,
        is_public: true,
        requires_approval: false,
        max_members: 50,
        guild_master_id: 'user2',
        guild_master_name: 'CasualConnoisseur',
        color_theme: '#10B981',
        created_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
        recruitment_bonus: 75,
        active_recruiters: 3,
        weekly_growth_rate: 18,
        competitive_ranking: 12,
        member_benefits: {
          discovery_bonus: 15,
          battle_support: false,
          exclusive_content: false,
          experience_multiplier: 1.2
        }
      }
    ];

    const mockMembers: GuildMember[] = [
      {
        id: 'member1',
        user_name: 'VintageViking',
        pet_name: 'Bordeaux Belle',
        role: 'leader',
        contribution_score: 2500,
        joined_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        last_active_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
        recruitment_count: 12
      },
      {
        id: 'member2',
        user_name: 'TuscanyTaster',
        pet_name: 'Noble Guardian',
        role: 'officer',
        contribution_score: 1800,
        joined_at: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
        last_active_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        recruitment_count: 8
      }
    ];

    const mockCampaigns: RecruitmentCampaign[] = [
      {
        id: 'campaign1',
        guild_id: 'guild1',
        title: 'Holiday Wine Discovery Challenge',
        description: 'Join us for a festive wine exploration event! New members get 2x experience for first month.',
        target_members: 20,
        current_signups: 7,
        recruitment_bonus: 200,
        campaign_type: 'event',
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        created_by: 'VintageViking',
        share_link: 'https://winesnap.com/guild/bordeaux-legends/join?campaign=holiday'
      }
    ];

    setAvailableGuilds(mockGuilds);
    setGuildMembers(mockMembers);
    setRecruitmentCampaigns(mockCampaigns);
    
    if (currentUser.guildId) {
      setCurrentGuild(mockGuilds.find(g => g.id === currentUser.guildId) || null);
    }
  }, [currentUser.guildId]);

  const getGuildTypeIcon = (type: Guild['guild_type']) => {
    switch (type) {
      case 'competitive': return <Sword className="w-5 h-5" />;
      case 'educational': return <Award className="w-5 h-5" />;
      case 'regional': return <MapPin className="w-5 h-5" />;
      default: return <Shield className="w-5 h-5" />;
    }
  };

  const getGuildTypeColor = (type: Guild['guild_type']) => {
    switch (type) {
      case 'competitive': return 'bg-red-100 text-red-700';
      case 'educational': return 'bg-blue-100 text-blue-700';
      case 'regional': return 'bg-green-100 text-green-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getRoleIcon = (role: GuildMember['role']) => {
    switch (role) {
      case 'leader': return <Crown className="w-4 h-4 text-yellow-600" />;
      case 'co_leader': return <Crown className="w-4 h-4 text-yellow-500" />;
      case 'officer': return <Star className="w-4 h-4 text-blue-600" />;
      default: return <Users className="w-4 h-4 text-gray-600" />;
    }
  };

  const handleShareRecruitment = async (campaign: RecruitmentCampaign) => {
    const shareText = `Join my guild "${currentGuild?.name}" in WineSnap! ${campaign.description} ${campaign.share_link}`;
    
    try {
      await navigator.clipboard.writeText(shareText);
      // Show success toast
    } catch (error) {
      console.error('Failed to copy recruitment link:', error);
    }
    
    onGuildAction?.('share_recruitment', { campaignId: campaign.id, platform: 'copy' });
  };

  const handleSocialShare = (campaign: RecruitmentCampaign, platform: string) => {
    const shareText = encodeURIComponent(`Join my wine guild "${currentGuild?.name}" in WineSnap! ${campaign.description}`);
    const shareUrl = encodeURIComponent(campaign.share_link);
    
    let platformUrl = '';
    
    switch (platform) {
      case 'twitter':
        platformUrl = `https://twitter.com/intent/tweet?text=${shareText}&url=${shareUrl}`;
        break;
      case 'facebook':
        platformUrl = `https://www.facebook.com/sharer/sharer.php?u=${shareUrl}&quote=${shareText}`;
        break;
      case 'whatsapp':
        platformUrl = `https://wa.me/?text=${shareText} ${shareUrl}`;
        break;
    }
    
    if (platformUrl) {
      window.open(platformUrl, '_blank', 'width=550,height=450');
      onGuildAction?.('share_recruitment', { campaignId: campaign.id, platform });
    }
  };

  const filteredGuilds = availableGuilds.filter(guild => 
    guild.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    guild.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    guild.focus_region?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (currentGuild) {
    return (
      <div className="w-full max-w-6xl mx-auto space-y-6">
        {/* Guild Header */}
        <Card className="border-2" style={{ borderColor: currentGuild.color_theme }}>
          <CardHeader className="pb-4" style={{ backgroundColor: `${currentGuild.color_theme}10` }}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div 
                  className="w-16 h-16 rounded-full flex items-center justify-center text-white text-2xl font-bold"
                  style={{ backgroundColor: currentGuild.color_theme }}
                >
                  {currentGuild.name.charAt(0)}
                </div>
                <div>
                  <CardTitle className="text-2xl flex items-center space-x-2">
                    <span>{currentGuild.name}</span>
                    <Badge className={getGuildTypeColor(currentGuild.guild_type)}>
                      {getGuildTypeIcon(currentGuild.guild_type)}
                      <span className="ml-1 capitalize">{currentGuild.guild_type}</span>
                    </Badge>
                  </CardTitle>
                  <p className="text-gray-600 mt-1">{currentGuild.description}</p>
                  <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                    <span>{currentGuild.member_count}/{currentGuild.max_members} members</span>
                    <span>•</span>
                    <span>Level {currentGuild.guild_level}</span>
                    <span>•</span>
                    <span>Rank #{currentGuild.competitive_ranking}</span>
                  </div>
                </div>
              </div>
              
              {(currentUser.guildRole === 'leader' || currentUser.guildRole === 'officer') && (
                <Button 
                  onClick={() => setRecruitmentOpen(true)}
                  style={{ backgroundColor: currentGuild.color_theme }}
                  className="text-white hover:opacity-90"
                >
                  <UserPlus className="w-4 h-4 mr-2" />
                  Start Recruitment
                </Button>
              )}
            </div>
          </CardHeader>
        </Card>

        <Tabs defaultValue="members" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="members">Members</TabsTrigger>
            <TabsTrigger value="recruitment">Recruitment</TabsTrigger>
            <TabsTrigger value="benefits">Benefits</TabsTrigger>
            <TabsTrigger value="wars">Guild Wars</TabsTrigger>
          </TabsList>

          {/* Members Tab */}
          <TabsContent value="members">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="w-5 h-5" />
                  <span>Guild Members ({currentGuild.member_count})</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {guildMembers.map((member) => (
                    <div key={member.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-4">
                        {getRoleIcon(member.role)}
                        <div>
                          <p className="font-semibold">{member.user_name}</p>
                          <p className="text-sm text-gray-600">{member.pet_name} • {member.role}</p>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <p className="text-lg font-bold text-purple-600">{member.contribution_score}</p>
                        <p className="text-sm text-gray-600">
                          {member.recruitment_count} recruits
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Recruitment Tab */}
          <TabsContent value="recruitment">
            <div className="space-y-4">
              {/* Active Campaigns */}
              {recruitmentCampaigns.map((campaign) => (
                <Card key={campaign.id} className="border-green-200 bg-green-50">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center space-x-2">
                        <Target className="w-5 h-5 text-green-600" />
                        <span>{campaign.title}</span>
                      </CardTitle>
                      <Badge className="bg-green-600">Active Campaign</Badge>
                    </div>
                    <p className="text-green-700">{campaign.description}</p>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="space-y-4">
                      {/* Campaign Progress */}
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-medium">Progress</span>
                          <span className="text-sm text-gray-600">
                            {campaign.current_signups}/{campaign.target_members} members
                          </span>
                        </div>
                        <Progress 
                          value={(campaign.current_signups / campaign.target_members) * 100}
                          className="h-3"
                        />
                      </div>

                      {/* Share Campaign */}
                      <div className="bg-white p-4 rounded-lg border border-green-200">
                        <h4 className="font-semibold mb-3 flex items-center space-x-2">
                          <Share2 className="w-4 h-4" />
                          <span>Share Recruitment Link</span>
                        </h4>
                        
                        <div className="space-y-3">
                          <div className="flex items-center space-x-2">
                            <Input 
                              value={campaign.share_link} 
                              readOnly 
                              className="text-sm"
                            />
                            <Button 
                              size="sm" 
                              onClick={() => handleShareRecruitment(campaign)}
                              className="flex-shrink-0"
                            >
                              <Copy className="w-4 h-4" />
                            </Button>
                          </div>
                          
                          <div className="flex space-x-2">
                            <Button 
                              size="sm" 
                              onClick={() => handleSocialShare(campaign, 'twitter')}
                              className="bg-blue-500 hover:bg-blue-600"
                            >
                              <ExternalLink className="w-4 h-4 mr-1" />
                              Twitter
                            </Button>
                            <Button 
                              size="sm"
                              onClick={() => handleSocialShare(campaign, 'facebook')}
                              className="bg-blue-600 hover:bg-blue-700"
                            >
                              <ExternalLink className="w-4 h-4 mr-1" />
                              Facebook
                            </Button>
                            <Button 
                              size="sm"
                              onClick={() => handleSocialShare(campaign, 'whatsapp')}
                              className="bg-green-500 hover:bg-green-600"
                            >
                              <MessageCircle className="w-4 h-4 mr-1" />
                              WhatsApp
                            </Button>
                          </div>
                        </div>
                      </div>

                      {/* Campaign Rewards */}
                      <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-lg">
                        <div className="flex items-center space-x-2 mb-2">
                          <Gift className="w-4 h-4 text-yellow-600" />
                          <span className="font-semibold text-yellow-800">Recruitment Rewards</span>
                        </div>
                        <div className="text-sm text-yellow-700">
                          <p>• +{campaign.recruitment_bonus} Prestige per successful recruit</p>
                          <p>• Exclusive "Guild Recruiter" badge at 5 recruits</p>
                          <p>• Officer promotion consideration at 10 recruits</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {/* Create New Campaign */}
              {(currentUser.guildRole === 'leader' || currentUser.guildRole === 'officer') && (
                <Card className="border-dashed border-2 border-purple-300">
                  <CardContent className="p-6 text-center">
                    <Target className="w-12 h-12 text-purple-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-purple-800 mb-2">Create Recruitment Campaign</h3>
                    <p className="text-purple-600 mb-4">
                      Launch targeted recruitment drives to grow your guild and unlock new benefits
                    </p>
                    <Button 
                      onClick={() => setRecruitmentOpen(true)}
                      className="bg-purple-600 hover:bg-purple-700"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Start New Campaign
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Benefits Tab */}
          <TabsContent value="benefits">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Gift className="w-5 h-5" />
                  <span>Guild Benefits</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-semibold text-lg">Current Benefits</h4>
                    
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                        <div className="flex items-center space-x-2">
                          <TrendingUp className="w-5 h-5 text-green-600" />
                          <span>Discovery Bonus</span>
                        </div>
                        <span className="font-bold text-green-700">
                          +{currentGuild.member_benefits.discovery_bonus}%
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                        <div className="flex items-center space-x-2">
                          <Star className="w-5 h-5 text-blue-600" />
                          <span>Experience Multiplier</span>
                        </div>
                        <span className="font-bold text-blue-700">
                          {currentGuild.member_benefits.experience_multiplier}x
                        </span>
                      </div>
                      
                      {currentGuild.member_benefits.battle_support && (
                        <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                          <div className="flex items-center space-x-2">
                            <Shield className="w-5 h-5 text-purple-600" />
                            <span>Battle Support</span>
                          </div>
                          <span className="font-bold text-purple-700">Active</span>
                        </div>
                      )}
                      
                      {currentGuild.member_benefits.exclusive_content && (
                        <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                          <div className="flex items-center space-x-2">
                            <Trophy className="w-5 h-5 text-yellow-600" />
                            <span>Exclusive Content</span>
                          </div>
                          <span className="font-bold text-yellow-700">Unlocked</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h4 className="font-semibold text-lg">Unlock at Higher Levels</h4>
                    
                    <div className="space-y-3">
                      <div className="p-3 bg-gray-50 rounded-lg opacity-60">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium">Guild Level 20</span>
                          <Badge variant="outline">Locked</Badge>
                        </div>
                        <p className="text-sm text-gray-600">• +50% Discovery Bonus</p>
                        <p className="text-sm text-gray-600">• Guild-exclusive tournaments</p>
                      </div>
                      
                      <div className="p-3 bg-gray-50 rounded-lg opacity-60">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium">100 Members</span>
                          <Badge variant="outline">Locked</Badge>
                        </div>
                        <p className="text-sm text-gray-600">• Territory control features</p>
                        <p className="text-sm text-gray-600">• Guild wine cellar</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Guild Wars Tab */}
          <TabsContent value="wars">
            <Card>
              <CardContent className="p-12 text-center">
                <Sword className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-700 mb-2">Guild Wars Coming Soon</h3>
                <p className="text-gray-600 mb-6">
                  Compete against other guilds in epic wine knowledge battles and territorial control
                </p>
                <Button variant="outline">
                  <Trophy className="w-4 h-4 mr-2" />
                  Learn More
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Recruitment Campaign Dialog */}
        <Dialog open={recruitmentOpen} onOpenChange={setRecruitmentOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Create Recruitment Campaign</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              <Input placeholder="Campaign title (e.g., 'New Year Wine Challenge')" />
              <Textarea placeholder="Campaign description and benefits..." />
              
              <div className="grid grid-cols-2 gap-3">
                <Input type="number" placeholder="Target members" />
                <Input type="number" placeholder="Campaign duration (days)" />
              </div>
              
              <div>
                <label className="text-sm font-medium">Campaign Type</label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <Button variant="outline" size="sm">Open Recruitment</Button>
                  <Button variant="outline" size="sm">Event Campaign</Button>
                </div>
              </div>

              <div className="flex space-x-2">
                <Button variant="outline" onClick={() => setRecruitmentOpen(false)} className="flex-1">
                  Cancel
                </Button>
                <Button onClick={() => setRecruitmentOpen(false)} className="flex-1">
                  Launch Campaign
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  // No guild - show guild discovery and creation
  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <Users className="w-6 h-6 text-purple-600" />
                <span>Join a Wine Guild</span>
              </CardTitle>
              <p className="text-gray-600 mt-1">Connect with fellow wine enthusiasts and grow together</p>
            </div>
            
            <Button onClick={() => setCreateGuildOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create Guild
            </Button>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="flex items-center space-x-2">
            <Search className="w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search guilds by name, region, or focus..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1"
            />
          </div>
        </CardContent>
      </Card>

      {/* Available Guilds */}
      <div className="space-y-4">
        {filteredGuilds.map((guild) => (
          <Card key={guild.id} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div 
                    className="w-12 h-12 rounded-full flex items-center justify-center text-white text-lg font-bold"
                    style={{ backgroundColor: guild.color_theme }}
                  >
                    {guild.name.charAt(0)}
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold flex items-center space-x-2">
                      <span>{guild.name}</span>
                      <Badge className={getGuildTypeColor(guild.guild_type)}>
                        {getGuildTypeIcon(guild.guild_type)}
                        <span className="ml-1 capitalize">{guild.guild_type}</span>
                      </Badge>
                    </h3>
                    <p className="text-gray-600 mt-1">{guild.description}</p>
                    <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                      <span>{guild.member_count}/{guild.max_members} members</span>
                      <span>•</span>
                      <span>Level {guild.guild_level}</span>
                      {guild.focus_region && (
                        <>
                          <span>•</span>
                          <span>{guild.focus_region} focused</span>
                        </>
                      )}
                      <span>•</span>
                      <span>+{guild.weekly_growth_rate}% growth</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className="text-right text-sm">
                    <p className="text-gray-600">Benefits</p>
                    <p className="font-semibold text-green-600">
                      +{guild.member_benefits.discovery_bonus}% Discovery
                    </p>
                  </div>
                  
                  <Button 
                    onClick={() => onGuildAction?.('join_guild', { guildId: guild.id })}
                    style={{ backgroundColor: guild.color_theme }}
                    className="text-white hover:opacity-90"
                  >
                    {guild.requires_approval ? 'Request to Join' : 'Join Guild'}
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Create Guild Dialog */}
      <Dialog open={createGuildOpen} onOpenChange={setCreateGuildOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Create Your Wine Guild</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <Input placeholder="Guild name..." />
            <Textarea placeholder="Guild description and mission..." />
            
            <div>
              <label className="text-sm font-medium">Guild Type</label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                <Button variant="outline" size="sm">
                  <Shield className="w-4 h-4 mr-2" />
                  Casual
                </Button>
                <Button variant="outline" size="sm">
                  <Sword className="w-4 h-4 mr-2" />
                  Competitive
                </Button>
                <Button variant="outline" size="sm">
                  <Award className="w-4 h-4 mr-2" />
                  Educational
                </Button>
                <Button variant="outline" size="sm">
                  <MapPin className="w-4 h-4 mr-2" />
                  Regional
                </Button>
              </div>
            </div>
            
            <Input placeholder="Focus region (optional)..." />
            
            <div className="grid grid-cols-2 gap-3">
              <Input type="number" placeholder="Max members" />
              <Input placeholder="Guild color theme" />
            </div>

            <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
              <h4 className="font-semibold text-blue-800 mb-2">Guild Creation Benefits</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Permanent "Guild Founder" status</li>
                <li>• Exclusive customization options</li>
                <li>• +500 Prestige Points for first 10 members</li>
                <li>• Access to advanced guild features</li>
              </ul>
            </div>

            <div className="flex space-x-2">
              <Button variant="outline" onClick={() => setCreateGuildOpen(false)} className="flex-1">
                Cancel
              </Button>
              <Button onClick={() => setCreateGuildOpen(false)} className="flex-1">
                Create Guild
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default GuildRecruitmentSystem;