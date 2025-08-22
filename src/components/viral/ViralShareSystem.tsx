'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Share2, 
  Trophy, 
  Crown, 
  Star, 
  Users, 
  Gift,
  Copy,
  Download,
  Instagram,
  Twitter,
  Facebook,
  MessageCircle,
  ExternalLink,
  Sparkles,
  Target,
  TrendingUp
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { UserPetWithDetails } from '@/types/pet';

interface ShareableContent {
  type: 'evolution' | 'achievement' | 'battle_victory' | 'rare_discovery' | 'collection_complete';
  title: string;
  description: string;
  imageUrl: string;
  videoUrl?: string;
  stats: Record<string, any>;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary' | 'mythic';
  shareText: string;
  deepLink: string;
  rewards: {
    referrerBonus: number;
    networkBonus: string;
  };
}

interface ViralShareSystemProps {
  content: ShareableContent;
  pet: UserPetWithDetails;
  userDisplayName: string;
  onShare?: (platform: string) => void;
  onClose?: () => void;
  isOpen?: boolean;
}

const ViralShareSystem: React.FC<ViralShareSystemProps> = ({
  content,
  pet,
  userDisplayName,
  onShare,
  onClose,
  isOpen = true
}) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const [shareStats, setShareStats] = useState({
    totalShares: 0,
    friendViews: 0,
    newJoins: 0
  });

  const shareText = `${content.shareText} Join me on WineSnap! ${content.deepLink}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(`${content.shareText} ${content.deepLink}`);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
      onShare?.('copy');
    } catch (error) {
      console.error('Failed to copy link:', error);
    }
  };

  const handlePlatformShare = (platform: string) => {
    const encodedText = encodeURIComponent(shareText);
    const encodedUrl = encodeURIComponent(content.deepLink);
    
    let shareUrl = '';
    
    switch (platform) {
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${encodedText}`;
        break;
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedText}`;
        break;
      case 'instagram':
        // Instagram sharing requires mobile app or special integration
        alert('Instagram sharing works best from the mobile app!');
        return;
      case 'whatsapp':
        shareUrl = `https://wa.me/?text=${encodedText}`;
        break;
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;
        break;
    }
    
    if (shareUrl) {
      window.open(shareUrl, '_blank', 'width=550,height=450');
      onShare?.(platform);
    }
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'text-gray-600 bg-gray-100';
      case 'uncommon': return 'text-green-600 bg-green-100';
      case 'rare': return 'text-blue-600 bg-blue-100';
      case 'epic': return 'text-purple-600 bg-purple-100';
      case 'legendary': return 'text-yellow-600 bg-yellow-100';
      case 'mythic': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getContentIcon = () => {
    switch (content.type) {
      case 'evolution': return <Sparkles className="w-6 h-6" />;
      case 'achievement': return <Trophy className="w-6 h-6" />;
      case 'battle_victory': return <Crown className="w-6 h-6" />;
      case 'rare_discovery': return <Star className="w-6 h-6" />;
      case 'collection_complete': return <Target className="w-6 h-6" />;
      default: return <Share2 className="w-6 h-6" />;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-3">
            {getContentIcon()}
            <span>Share Your Achievement!</span>
            <Badge className={getRarityColor(content.rarity)}>
              {content.rarity.toUpperCase()}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Content Preview */}
          <Card className="border-2 border-dashed border-purple-300 bg-purple-50">
            <CardContent className="p-6">
              <div className="flex items-start space-x-4">
                {/* Pet Avatar */}
                <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl">🍷</span>
                </div>

                {/* Content */}
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-purple-800 mb-2">
                    {content.title}
                  </h3>
                  <p className="text-purple-600 mb-4">{content.description}</p>
                  
                  {/* Stats Display */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    {Object.entries(content.stats).map(([key, value]) => (
                      <div key={key} className="flex justify-between">
                        <span className="capitalize text-gray-600">{key.replace('_', ' ')}:</span>
                        <span className="font-semibold text-purple-700">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Visual Content */}
                <div className="w-24 h-24 bg-gradient-to-br from-yellow-400 to-orange-400 rounded-lg flex items-center justify-center">
                  {content.videoUrl ? (
                    <div className="text-center">
                      <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center mb-1">
                        <div className="w-0 h-0 border-l-[8px] border-l-black border-y-[6px] border-y-transparent ml-1"></div>
                      </div>
                      <p className="text-xs text-white">15s video</p>
                    </div>
                  ) : (
                    <span className="text-3xl">{getContentIcon()}</span>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Share Benefits */}
          <Card className="bg-green-50 border-green-200">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3 mb-3">
                <Gift className="w-5 h-5 text-green-600" />
                <h4 className="font-semibold text-green-800">Share Rewards</h4>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-green-600">You Get:</p>
                  <p className="font-semibold text-green-800">+{content.rewards.referrerBonus} Prestige Points</p>
                  <p className="text-green-600">{content.rewards.networkBonus}</p>
                </div>
                <div>
                  <p className="text-green-600">New Friends Get:</p>
                  <p className="font-semibold text-green-800">Premium Pet Species</p>
                  <p className="text-green-600">3x Experience Boost (1 week)</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Share Statistics */}
          {shareStats.totalShares > 0 && (
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold flex items-center space-x-2">
                    <TrendingUp className="w-4 h-4 text-blue-600" />
                    <span>Share Impact</span>
                  </h4>
                </div>
                <div className="grid grid-cols-3 gap-4 text-center text-sm">
                  <div>
                    <p className="text-2xl font-bold text-blue-600">{shareStats.totalShares}</p>
                    <p className="text-gray-600">Total Shares</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-green-600">{shareStats.friendViews}</p>
                    <p className="text-gray-600">Friend Views</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-purple-600">{shareStats.newJoins}</p>
                    <p className="text-gray-600">New Joins</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Share Buttons */}
          <div className="space-y-4">
            {/* Quick Copy */}
            <div className="flex items-center space-x-2">
              <Button
                onClick={handleCopyLink}
                className={`flex-1 ${copiedLink ? 'bg-green-600 hover:bg-green-700' : ''}`}
                variant={copiedLink ? 'default' : 'outline'}
              >
                {copiedLink ? (
                  <>
                    <span className="mr-2">✓</span>
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 mr-2" />
                    Copy Share Link
                  </>
                )}
              </Button>
              
              {content.imageUrl && (
                <Button variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Save Image
                </Button>
              )}
            </div>

            {/* Platform Share Buttons */}
            <div className="grid grid-cols-2 gap-3">
              <Button
                onClick={() => handlePlatformShare('twitter')}
                className="bg-blue-500 hover:bg-blue-600 text-white"
              >
                <Twitter className="w-4 h-4 mr-2" />
                Twitter
              </Button>
              
              <Button
                onClick={() => handlePlatformShare('facebook')}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Facebook className="w-4 h-4 mr-2" />
                Facebook
              </Button>
              
              <Button
                onClick={() => handlePlatformShare('instagram')}
                className="bg-gradient-to-r from-pink-500 to-yellow-500 hover:from-pink-600 hover:to-yellow-600 text-white"
              >
                <Instagram className="w-4 h-4 mr-2" />
                Instagram
              </Button>
              
              <Button
                onClick={() => handlePlatformShare('whatsapp')}
                className="bg-green-500 hover:bg-green-600 text-white"
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                WhatsApp
              </Button>
            </div>

            {/* Professional Networks */}
            <Button
              onClick={() => handlePlatformShare('linkedin')}
              className="w-full bg-blue-700 hover:bg-blue-800 text-white"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Share on LinkedIn (Wine Education Progress)
            </Button>
          </div>

          {/* Challenge Friends */}
          <Card className="bg-purple-50 border-purple-200">
            <CardContent className="p-4 text-center">
              <Users className="w-8 h-8 text-purple-600 mx-auto mb-2" />
              <h4 className="font-semibold text-purple-800 mb-1">Challenge Your Network</h4>
              <p className="text-sm text-purple-600 mb-3">
                Invite friends to beat your achievement and start friendly competitions
              </p>
              <Button 
                variant="outline" 
                className="border-purple-300 text-purple-700 hover:bg-purple-100"
              >
                <Target className="w-4 h-4 mr-2" />
                Create Friend Challenge
              </Button>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ViralShareSystem;