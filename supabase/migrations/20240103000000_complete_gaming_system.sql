-- Complete Gaming System Migration for WineSnap
-- This migration adds the full gaming system including:
-- - Enhanced Pokédex wine collection system  
-- - Advanced Tamagotchi pet mechanics with evolution, battles, and skill trees
-- - Achievement system with social sharing
-- - Friend system with battles and trading  
-- - Guild system with viral growth mechanics
-- - Social features and leaderboards

-- ============================================================================
-- WINE POKÉDEX COLLECTION SYSTEM
-- ============================================================================

-- Wine categories for Pokédex organization
CREATE TABLE IF NOT EXISTS wine_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    category_type TEXT CHECK (category_type IN ('region', 'grape_variety', 'style', 'vintage_era', 'price_tier')),
    parent_category_id UUID REFERENCES wine_categories(id),
    completion_reward_xp INTEGER DEFAULT 0,
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enhanced wine entries with gaming metadata
CREATE TABLE IF NOT EXISTS wine_pokedex_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Basic Wine Information
    name TEXT NOT NULL,
    producer_name TEXT,
    region TEXT,
    country TEXT,
    vintage INTEGER CHECK (vintage >= 1800 AND vintage <= EXTRACT(YEAR FROM NOW()) + 2),
    wine_type TEXT NOT NULL CHECK (wine_type IN ('red', 'white', 'rosé', 'sparkling', 'fortified', 'dessert', 'natural')),
    grape_varieties JSONB, -- Array of grape varieties with percentages
    alcohol_content DECIMAL(4, 2) CHECK (alcohol_content >= 0 AND alcohol_content <= 50),
    
    -- Gaming Metadata
    rarity_tier TEXT NOT NULL DEFAULT 'common' CHECK (rarity_tier IN ('common', 'uncommon', 'rare', 'epic', 'legendary', 'mythic')),
    discovery_difficulty INTEGER DEFAULT 1 CHECK (discovery_difficulty >= 1 AND discovery_difficulty <= 10),
    base_experience_reward INTEGER DEFAULT 10,
    bonus_experience_multiplier DECIMAL(3,2) DEFAULT 1.00,
    
    -- Collection Stats
    total_discoveries INTEGER DEFAULT 0,
    unique_discoverers INTEGER DEFAULT 0,
    first_discovered_at TIMESTAMPTZ,
    first_discoverer_id UUID REFERENCES profiles(id),
    
    -- Quality and Pricing
    average_quality_score DECIMAL(3,2),
    price_tier TEXT CHECK (price_tier IN ('budget', 'mid_range', 'premium', 'luxury', 'ultra_luxury')),
    estimated_price_min DECIMAL(10,2),
    estimated_price_max DECIMAL(10,2),
    
    -- Educational Content
    tasting_notes TEXT,
    food_pairing_suggestions JSONB,
    serving_temperature_range TEXT,
    decanting_recommendations TEXT,
    aging_potential_years INTEGER,
    educational_facts JSONB,
    
    -- Media
    image_urls JSONB,
    video_urls JSONB,
    
    -- Categories
    category_ids UUID[] DEFAULT '{}',
    
    -- Status
    is_verified BOOLEAN DEFAULT false,
    is_seasonal BOOLEAN DEFAULT false, -- Limited time availability
    seasonal_start DATE,
    seasonal_end DATE,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User wine discoveries (Pokédex entries)
CREATE TABLE IF NOT EXISTS user_wine_discoveries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    wine_entry_id UUID NOT NULL REFERENCES wine_pokedex_entries(id) ON DELETE CASCADE,
    
    -- Discovery Details
    discovered_at TIMESTAMPTZ DEFAULT NOW(),
    discovery_method TEXT CHECK (discovery_method IN ('tasting', 'photo_capture', 'voice_note', 'manual_entry', 'recommendation', 'gift')),
    discovery_location TEXT,
    discovery_context JSONB, -- Event, social situation, etc.
    
    -- User's Experience
    personal_rating DECIMAL(2,1) CHECK (personal_rating >= 0 AND personal_rating <= 5),
    tasting_notes TEXT,
    voice_note_url TEXT,
    photo_urls JSONB,
    
    -- Gaming Rewards
    experience_gained INTEGER DEFAULT 0,
    bonus_multiplier DECIMAL(3,2) DEFAULT 1.00,
    is_first_discovery BOOLEAN DEFAULT false, -- First person to discover this wine
    achievement_unlocked UUID[], -- Achievement IDs unlocked by this discovery
    
    -- Status
    is_favorite BOOLEAN DEFAULT false,
    is_wishlist BOOLEAN DEFAULT false,
    completion_percentage INTEGER DEFAULT 100, -- For wines with multiple variations
    
    UNIQUE(user_id, wine_entry_id)
);

-- Regional collection progress tracking
CREATE TABLE IF NOT EXISTS regional_collections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    region_name TEXT NOT NULL,
    country TEXT NOT NULL,
    
    -- Collection Stats
    total_wines_available INTEGER DEFAULT 0,
    wines_discovered INTEGER DEFAULT 0,
    completion_percentage DECIMAL(5,2) DEFAULT 0.00,
    
    -- Rarity Breakdown
    common_discovered INTEGER DEFAULT 0,
    uncommon_discovered INTEGER DEFAULT 0,
    rare_discovered INTEGER DEFAULT 0,
    epic_discovered INTEGER DEFAULT 0,
    legendary_discovered INTEGER DEFAULT 0,
    mythic_discovered INTEGER DEFAULT 0,
    
    -- Progress
    is_completed BOOLEAN DEFAULT false,
    completed_at TIMESTAMPTZ,
    completion_reward_claimed BOOLEAN DEFAULT false,
    
    -- Streaks
    current_discovery_streak INTEGER DEFAULT 0,
    longest_discovery_streak INTEGER DEFAULT 0,
    
    last_discovery_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(user_id, region_name, country)
);

-- ============================================================================
-- ENHANCED GAMING PROFILES
-- ============================================================================

-- Enhanced gaming profiles (extends existing profiles)
CREATE TABLE IF NOT EXISTS gaming_profiles (
    id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
    username TEXT UNIQUE CHECK (length(username) >= 3 AND length(username) <= 30),
    
    -- Gaming Stats
    level INTEGER DEFAULT 1,
    total_experience BIGINT DEFAULT 0,
    prestige_level INTEGER DEFAULT 0,
    prestige_points INTEGER DEFAULT 0,
    
    -- Activity Streaks
    current_streak INTEGER DEFAULT 0,
    longest_streak INTEGER DEFAULT 0,
    last_activity_date DATE DEFAULT CURRENT_DATE,
    
    -- Pokédex Collection Stats
    total_wines_discovered INTEGER DEFAULT 0,
    unique_regions_discovered INTEGER DEFAULT 0,
    unique_producers_discovered INTEGER DEFAULT 0,
    rare_wines_found INTEGER DEFAULT 0,
    legendary_wines_found INTEGER DEFAULT 0,
    
    -- Battle Stats
    total_battles INTEGER DEFAULT 0,
    battles_won INTEGER DEFAULT 0,
    battles_lost INTEGER DEFAULT 0,
    tournament_wins INTEGER DEFAULT 0,
    
    -- Privacy Settings
    is_public BOOLEAN DEFAULT true,
    show_collection BOOLEAN DEFAULT true,
    show_battle_history BOOLEAN DEFAULT true,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================  
-- COMPREHENSIVE ACHIEVEMENT SYSTEM
-- ============================================================================

-- Gaming achievements with social sharing
CREATE TABLE IF NOT EXISTS gaming_achievements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    description TEXT NOT NULL,
    flavor_text TEXT, -- Immersive description
    
    -- Achievement Metadata
    category TEXT CHECK (category IN (
        'discovery', 'collection', 'social', 'battle', 'education', 
        'dedication', 'exploration', 'mastery', 'seasonal', 'secret'
    )),
    subcategory TEXT, -- More specific categorization
    
    -- Requirements
    requirements JSONB NOT NULL, -- Complex requirement structure
    requirement_logic TEXT DEFAULT 'AND' CHECK (requirement_logic IN ('AND', 'OR')),
    
    -- Rewards
    experience_reward INTEGER DEFAULT 0,
    prestige_reward INTEGER DEFAULT 0,
    badge_image_url TEXT,
    title_unlocked TEXT,
    pet_customization_unlocked JSONB DEFAULT '{}',
    special_rewards JSONB DEFAULT '{}',
    
    -- Achievement Properties
    rarity_tier TEXT DEFAULT 'common' CHECK (rarity_tier IN ('common', 'uncommon', 'rare', 'epic', 'legendary', 'mythic')),
    is_hidden BOOLEAN DEFAULT false, -- Hidden until unlocked
    is_retroactive BOOLEAN DEFAULT true, -- Can be earned for past activities
    is_seasonal BOOLEAN DEFAULT false,
    is_repeatable BOOLEAN DEFAULT false,
    
    -- Time Constraints
    available_from TIMESTAMPTZ,
    available_until TIMESTAMPTZ,
    
    -- Statistics
    total_earned INTEGER DEFAULT 0,
    first_earned_at TIMESTAMPTZ,
    first_earned_by UUID REFERENCES profiles(id),
    
    -- Difficulty and Rarity
    difficulty_rating INTEGER DEFAULT 1 CHECK (difficulty_rating >= 1 AND difficulty_rating <= 10),
    estimated_completion_time TEXT, -- "1 week", "6 months", etc.
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User achievement progress and unlocks
CREATE TABLE IF NOT EXISTS user_achievements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    achievement_id UUID NOT NULL REFERENCES gaming_achievements(id) ON DELETE CASCADE,
    
    -- Progress Tracking
    current_progress JSONB DEFAULT '{}', -- Progress towards requirements
    progress_percentage DECIMAL(5,2) DEFAULT 0.00,
    is_completed BOOLEAN DEFAULT false,
    
    -- Completion Details
    completed_at TIMESTAMPTZ,
    completion_method TEXT, -- How it was earned
    completion_context JSONB, -- Additional context
    
    -- Rewards Claimed
    rewards_claimed BOOLEAN DEFAULT false,
    rewards_claimed_at TIMESTAMPTZ,
    
    -- Display
    is_featured BOOLEAN DEFAULT false, -- User wants to feature this achievement
    earned_title_active BOOLEAN DEFAULT false,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(user_id, achievement_id)
);

-- ============================================================================
-- FRIEND SYSTEM WITH BATTLES AND TRADING
-- ============================================================================

-- Enhanced friendship system with gaming elements
CREATE TABLE IF NOT EXISTS gaming_friendships (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    requester_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    addressee_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'blocked', 'best_friend')),
    
    -- Gaming-Specific Features
    friendship_level INTEGER DEFAULT 1,
    friendship_experience INTEGER DEFAULT 0,
    shared_activities_count INTEGER DEFAULT 0,
    wine_discoveries_shared INTEGER DEFAULT 0,
    battles_together INTEGER DEFAULT 0,
    
    -- Interaction History
    last_interaction_at TIMESTAMPTZ,
    interaction_streak INTEGER DEFAULT 0,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(requester_id, addressee_id),
    CHECK (requester_id != addressee_id)
);

-- Wine discovery sharing and reactions
CREATE TABLE IF NOT EXISTS discovery_shares (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    discovery_id UUID NOT NULL REFERENCES user_wine_discoveries(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    
    -- Share Details
    share_type TEXT DEFAULT 'public' CHECK (share_type IN ('public', 'friends', 'guild', 'private')),
    caption TEXT CHECK (length(caption) <= 500),
    tags TEXT[] DEFAULT '{}',
    
    -- Engagement
    view_count INTEGER DEFAULT 0,
    like_count INTEGER DEFAULT 0,
    comment_count INTEGER DEFAULT 0,
    share_count INTEGER DEFAULT 0,
    
    -- Gaming Elements
    experience_earned INTEGER DEFAULT 0,
    achievements_unlocked UUID[] DEFAULT '{}',
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Social reactions to discoveries
CREATE TABLE IF NOT EXISTS discovery_reactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    discovery_share_id UUID NOT NULL REFERENCES discovery_shares(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    
    reaction_type TEXT DEFAULT 'like' CHECK (reaction_type IN ('like', 'love', 'wow', 'cheers', 'bookmark', 'want_to_try')),
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(discovery_share_id, user_id, reaction_type)
);

-- ============================================================================
-- GUILD SYSTEM WITH VIRAL GROWTH
-- ============================================================================

-- Wine guilds/clubs system
CREATE TABLE IF NOT EXISTS wine_guilds (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE CHECK (length(name) >= 3 AND length(name) <= 50),
    description TEXT CHECK (length(description) <= 1000),
    guild_type TEXT CHECK (guild_type IN ('casual', 'competitive', 'educational', 'regional')),
    focus_region TEXT, -- Optional regional focus
    
    -- Guild Stats
    member_count INTEGER DEFAULT 0,
    total_guild_experience BIGINT DEFAULT 0,
    guild_level INTEGER DEFAULT 1,
    
    -- Guild Settings
    is_public BOOLEAN DEFAULT true,
    requires_approval BOOLEAN DEFAULT false,
    max_members INTEGER DEFAULT 100,
    
    -- Guild Master
    guild_master_id UUID NOT NULL REFERENCES profiles(id),
    
    -- Visual
    banner_url TEXT,
    color_theme TEXT DEFAULT '#8B5CF6',
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Guild memberships
CREATE TABLE IF NOT EXISTS guild_memberships (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    guild_id UUID NOT NULL REFERENCES wine_guilds(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    role TEXT DEFAULT 'member' CHECK (role IN ('member', 'officer', 'co_leader', 'leader')),
    contribution_score INTEGER DEFAULT 0,
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    last_active_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(guild_id, user_id)
);

-- Referral system for viral growth
CREATE TABLE IF NOT EXISTS user_referrals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    referrer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    referred_user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    referral_code TEXT NOT NULL,
    
    -- Status tracking
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'rewarded')),
    referred_at TIMESTAMPTZ DEFAULT NOW(),
    activated_at TIMESTAMPTZ, -- When referred user becomes active
    rewarded_at TIMESTAMPTZ, -- When referrer receives rewards
    
    -- Rewards
    referrer_rewards JSONB DEFAULT '{}',
    referred_rewards JSONB DEFAULT '{}',
    milestone_rewards_claimed JSONB DEFAULT '{}',
    
    UNIQUE(referrer_id, referred_user_id),
    CHECK (referrer_id != referred_user_id)
);

-- ============================================================================
-- LEADERBOARDS AND COMPETITIONS
-- ============================================================================

-- Leaderboard system
CREATE TABLE IF NOT EXISTS leaderboards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    leaderboard_type TEXT CHECK (leaderboard_type IN (
        'experience', 'discoveries', 'battle_rating', 'pet_level', 'collection_completion',
        'regional_expertise', 'streak', 'social_activity', 'guild_contribution'
    )),
    
    -- Leaderboard Rules
    scoring_formula TEXT NOT NULL, -- SQL expression for calculating score
    update_frequency TEXT DEFAULT 'daily' CHECK (update_frequency IN ('realtime', 'hourly', 'daily', 'weekly', 'monthly')),
    time_window TEXT CHECK (time_window IN ('all_time', 'monthly', 'weekly', 'daily', 'seasonal')),
    
    -- Filters and Requirements
    min_level_requirement INTEGER DEFAULT 1,
    category_filter TEXT, -- Optional filter (e.g., specific wine regions)
    
    -- Rewards
    top_rewards JSONB DEFAULT '{}', -- Rewards for top positions
    participation_rewards JSONB DEFAULT '{}',
    
    -- Display
    icon_url TEXT,
    is_public BOOLEAN DEFAULT true,
    is_seasonal BOOLEAN DEFAULT false,
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    last_updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Leaderboard entries (cached rankings)
CREATE TABLE IF NOT EXISTS leaderboard_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    leaderboard_id UUID NOT NULL REFERENCES leaderboards(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    
    -- Ranking Data
    current_rank INTEGER NOT NULL,
    previous_rank INTEGER,
    score BIGINT NOT NULL,
    previous_score BIGINT,
    
    -- Additional Display Data
    display_name TEXT,
    avatar_url TEXT,
    additional_data JSONB DEFAULT '{}', -- Category-specific data
    
    -- Metadata
    calculation_date TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(leaderboard_id, user_id),
    UNIQUE(leaderboard_id, current_rank)
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- Gaming profiles indexes
CREATE INDEX IF NOT EXISTS idx_gaming_profiles_level ON gaming_profiles(level DESC, total_experience DESC);
CREATE INDEX IF NOT EXISTS idx_gaming_profiles_prestige ON gaming_profiles(prestige_level DESC, prestige_points DESC);
CREATE INDEX IF NOT EXISTS idx_gaming_profiles_username ON gaming_profiles(username);

-- Wine discovery indexes
CREATE INDEX IF NOT EXISTS idx_wine_pokedex_rarity ON wine_pokedex_entries(rarity_tier, discovery_difficulty);
CREATE INDEX IF NOT EXISTS idx_wine_pokedex_type ON wine_pokedex_entries(wine_type);
CREATE INDEX IF NOT EXISTS idx_wine_pokedex_region ON wine_pokedex_entries(region, country);
CREATE INDEX IF NOT EXISTS idx_wine_pokedex_discoveries ON wine_pokedex_entries(total_discoveries DESC);

-- User discovery indexes
CREATE INDEX IF NOT EXISTS idx_user_discoveries_user ON user_wine_discoveries(user_id, discovered_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_discoveries_wine ON user_wine_discoveries(wine_entry_id);
CREATE INDEX IF NOT EXISTS idx_user_discoveries_first ON user_wine_discoveries(is_first_discovery) WHERE is_first_discovery = true;

-- Achievement indexes
CREATE INDEX IF NOT EXISTS idx_user_achievements_user ON user_achievements(user_id, is_completed);
CREATE INDEX IF NOT EXISTS idx_user_achievements_completion ON user_achievements(completed_at DESC) WHERE is_completed = true;

-- Social indexes
CREATE INDEX IF NOT EXISTS idx_gaming_friendships_user ON gaming_friendships(requester_id, addressee_id, status);
CREATE INDEX IF NOT EXISTS idx_discovery_shares_user ON discovery_shares(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_discovery_shares_public ON discovery_shares(share_type, created_at DESC) WHERE share_type = 'public';

-- Leaderboard indexes
CREATE INDEX IF NOT EXISTS idx_leaderboard_entries_board_rank ON leaderboard_entries(leaderboard_id, current_rank);
CREATE INDEX IF NOT EXISTS idx_leaderboard_entries_user ON leaderboard_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_leaderboard_entries_score ON leaderboard_entries(leaderboard_id, score DESC);

-- ============================================================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE gaming_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE wine_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE wine_pokedex_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_wine_discoveries ENABLE ROW LEVEL SECURITY;
ALTER TABLE regional_collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE gaming_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE gaming_friendships ENABLE ROW LEVEL SECURITY;
ALTER TABLE discovery_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE discovery_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE wine_guilds ENABLE ROW LEVEL SECURITY;
ALTER TABLE guild_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE leaderboards ENABLE ROW LEVEL SECURITY;
ALTER TABLE leaderboard_entries ENABLE ROW LEVEL SECURITY;

-- Public read policies for reference data
CREATE POLICY "Wine categories are publicly viewable" ON wine_categories FOR SELECT USING (true);
CREATE POLICY "Wine Pokédex entries are publicly viewable" ON wine_pokedex_entries FOR SELECT USING (true);
CREATE POLICY "Gaming achievements are publicly viewable" ON gaming_achievements FOR SELECT USING (true);
CREATE POLICY "Leaderboards are publicly viewable" ON leaderboards FOR SELECT USING (is_public = true);

-- User profile policies
CREATE POLICY "Public gaming profiles are viewable" ON gaming_profiles FOR SELECT USING (is_public = true OR auth.uid() = id);
CREATE POLICY "Users can update own gaming profile" ON gaming_profiles FOR UPDATE USING (auth.uid() = id);

-- User wine discoveries policies
CREATE POLICY "Users can view own discoveries" ON user_wine_discoveries FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can view public discoveries" ON user_wine_discoveries FOR SELECT USING (
    user_id IN (SELECT id FROM gaming_profiles WHERE is_public = true)
);
CREATE POLICY "Users can create own discoveries" ON user_wine_discoveries FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own discoveries" ON user_wine_discoveries FOR UPDATE USING (auth.uid() = user_id);

-- Achievement policies
CREATE POLICY "Users can view own achievements" ON user_achievements FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can view public achievements" ON user_achievements FOR SELECT USING (
    user_id IN (SELECT id FROM gaming_profiles WHERE is_public = true)
);

-- Social policies
CREATE POLICY "Users can manage their friendships" ON gaming_friendships FOR ALL USING (
    auth.uid() = requester_id OR auth.uid() = addressee_id
);
CREATE POLICY "Users can view public discovery shares" ON discovery_shares FOR SELECT USING (
    share_type = 'public' OR user_id = auth.uid()
);
CREATE POLICY "Users can manage own discovery shares" ON discovery_shares FOR ALL USING (auth.uid() = user_id);

-- Guild policies
CREATE POLICY "Users can view public guilds" ON wine_guilds FOR SELECT USING (is_public = true);
CREATE POLICY "Guild members can view their guild details" ON wine_guilds FOR SELECT USING (
    id IN (SELECT guild_id FROM guild_memberships WHERE user_id = auth.uid())
);
CREATE POLICY "Users can manage guild memberships" ON guild_memberships FOR ALL USING (auth.uid() = user_id);

-- ============================================================================
-- INITIAL GAME DATA
-- ============================================================================

-- Insert wine categories for Pokédex organization
INSERT INTO wine_categories (name, description, category_type, completion_reward_xp) VALUES
-- Regional Categories
('French Wines', 'Wines from the prestigious wine regions of France', 'region', 500),
('Italian Wines', 'Wines from the diverse wine regions of Italy', 'region', 500),
('Spanish Wines', 'Wines from the traditional wine regions of Spain', 'region', 400),
('German Wines', 'Wines from the cool climate regions of Germany', 'region', 400),
('New World Wines', 'Wines from emerging wine regions worldwide', 'region', 600),

-- Style Categories
('Red Wines', 'Full-bodied to light red wines', 'style', 300),
('White Wines', 'Crisp to rich white wines', 'style', 300),
('Sparkling Wines', 'Effervescent wines from around the world', 'style', 400),
('Dessert Wines', 'Sweet wines perfect for dessert', 'style', 500),
('Fortified Wines', 'Wines strengthened with additional alcohol', 'style', 600),

-- Rarity Categories
('Rare Discoveries', 'Uncommon and rare wine finds', 'rarity', 1000),
('Legendary Vintages', 'The most exceptional wines ever made', 'rarity', 2000)
ON CONFLICT (name) DO NOTHING;

-- Insert sample gaming achievements
INSERT INTO gaming_achievements (name, description, category, requirements, experience_reward, prestige_reward, rarity_tier) VALUES
('First Sip', 'Discover your first wine', 'discovery', '{"total_discoveries": 1}', 50, 10, 'common'),
('Wine Explorer', 'Discover 10 different wines', 'discovery', '{"total_discoveries": 10}', 200, 25, 'common'),
('Connoisseur', 'Discover 50 different wines', 'discovery', '{"total_discoveries": 50}', 1000, 100, 'uncommon'),
('Master Taster', 'Discover 200 different wines', 'discovery', '{"total_discoveries": 200}', 5000, 500, 'rare'),

('Regional Explorer', 'Discover wines from 5 different regions', 'collection', '{"unique_regions": 5}', 300, 50, 'uncommon'),
('World Traveler', 'Discover wines from 10 different countries', 'collection', '{"unique_countries": 10}', 750, 100, 'rare'),
('Globe Trotter', 'Discover wines from 20 different countries', 'collection', '{"unique_countries": 20}', 2000, 300, 'epic'),

('Pet Parent', 'Adopt your first pet', 'dedication', '{"has_pet": true}', 100, 20, 'common'),
('Level Up', 'Reach user level 10', 'mastery', '{"user_level": 10}', 500, 75, 'uncommon'),
('Wine Sage', 'Reach user level 25', 'mastery', '{"user_level": 25}', 1500, 200, 'rare'),
('Grandmaster', 'Reach user level 50', 'mastery', '{"user_level": 50}', 5000, 1000, 'legendary'),

('Battle Ready', 'Win your first pet battle', 'battle', '{"battle_wins": 1}', 200, 30, 'common'),
('Champion', 'Win 10 pet battles', 'battle', '{"battle_wins": 10}', 750, 100, 'uncommon'),
('Battle Master', 'Win 50 pet battles', 'battle', '{"battle_wins": 50}', 2500, 400, 'rare')
ON CONFLICT (name) DO NOTHING;

-- Insert sample leaderboards
INSERT INTO leaderboards (name, description, leaderboard_type, scoring_formula, update_frequency, is_public) VALUES
('Top Explorers', 'Most wines discovered', 'discoveries', 'total_wines_discovered', 'daily', true),
('Experience Leaders', 'Highest total experience', 'experience', 'total_experience', 'daily', true),
('Pet Masters', 'Highest level pets', 'pet_level', 'MAX(level) FROM user_pets WHERE user_id = gaming_profiles.id', 'daily', true),
('Wine Collectors', 'Most complete regional collections', 'collection_completion', 'AVG(completion_percentage) FROM regional_collections WHERE user_id = gaming_profiles.id', 'weekly', true)
ON CONFLICT (name) DO NOTHING;

-- ============================================================================
-- GAMING FUNCTIONS
-- ============================================================================

-- Function to update user level based on experience
CREATE OR REPLACE FUNCTION update_user_level()
RETURNS TRIGGER AS $$
DECLARE
    new_level INTEGER;
BEGIN
    -- Calculate new level (exponential curve: level^2 * 100)
    new_level := FLOOR(SQRT(NEW.total_experience / 100.0)) + 1;
    
    -- Update level if changed
    IF new_level != NEW.level THEN
        NEW.level := new_level;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for level updates
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_gaming_profile_level') THEN
        CREATE TRIGGER update_gaming_profile_level
            BEFORE UPDATE OF total_experience ON gaming_profiles
            FOR EACH ROW EXECUTE FUNCTION update_user_level();
    END IF;
END $$;

-- Function to process wine discovery and award rewards
CREATE OR REPLACE FUNCTION process_wine_discovery(
    p_user_id UUID,
    p_wine_entry_id UUID,
    p_discovery_method TEXT DEFAULT 'tasting'
)
RETURNS JSON AS $$
DECLARE
    wine_entry RECORD;
    user_profile RECORD;
    base_experience INTEGER;
    bonus_experience INTEGER := 0;
    total_experience INTEGER;
    rewards JSON := '{}';
    is_first_global BOOLEAN := false;
    rarity_bonus DECIMAL := 1.0;
    streak_bonus DECIMAL := 1.0;
BEGIN
    -- Get wine entry details
    SELECT * INTO wine_entry FROM wine_pokedex_entries WHERE id = p_wine_entry_id;
    IF NOT FOUND THEN
        RETURN json_build_object('error', 'Wine entry not found');
    END IF;
    
    -- Get user profile
    SELECT * INTO user_profile FROM gaming_profiles WHERE id = p_user_id;
    IF NOT FOUND THEN
        RETURN json_build_object('error', 'User profile not found');
    END IF;
    
    -- Check if this is the first global discovery
    IF wine_entry.total_discoveries = 0 THEN
        is_first_global := true;
        bonus_experience := bonus_experience + 100;
        
        -- Update wine entry with first discoverer
        UPDATE wine_pokedex_entries 
        SET 
            first_discovered_at = NOW(),
            first_discoverer_id = p_user_id,
            total_discoveries = 1,
            unique_discoverers = 1
        WHERE id = p_wine_entry_id;
    ELSE
        -- Update wine entry stats
        UPDATE wine_pokedex_entries 
        SET 
            total_discoveries = total_discoveries + 1,
            unique_discoverers = unique_discoverers + 1
        WHERE id = p_wine_entry_id;
    END IF;
    
    -- Calculate base experience
    base_experience := wine_entry.base_experience_reward;
    
    -- Apply rarity bonus
    rarity_bonus := CASE wine_entry.rarity_tier
        WHEN 'common' THEN 1.0
        WHEN 'uncommon' THEN 1.2
        WHEN 'rare' THEN 1.5
        WHEN 'epic' THEN 2.0
        WHEN 'legendary' THEN 3.0
        WHEN 'mythic' THEN 5.0
        ELSE 1.0
    END;
    
    -- Calculate streak bonus (up to 2x for 30+ day streak)
    IF user_profile.current_streak >= 30 THEN
        streak_bonus := 2.0;
    ELSIF user_profile.current_streak >= 7 THEN
        streak_bonus := 1.0 + (user_profile.current_streak * 0.03);
    END IF;
    
    -- Calculate total experience
    total_experience := FLOOR((base_experience + bonus_experience) * rarity_bonus * streak_bonus * wine_entry.bonus_experience_multiplier);
    
    -- Create user discovery record
    INSERT INTO user_wine_discoveries (
        user_id, wine_entry_id, discovery_method, experience_gained,
        bonus_multiplier, is_first_discovery
    ) VALUES (
        p_user_id, p_wine_entry_id, p_discovery_method, total_experience,
        rarity_bonus * streak_bonus * wine_entry.bonus_experience_multiplier,
        is_first_global
    ) ON CONFLICT (user_id, wine_entry_id) DO UPDATE SET
        discovered_at = NOW(),
        experience_gained = EXCLUDED.experience_gained + user_wine_discoveries.experience_gained;
    
    -- Update user stats
    UPDATE gaming_profiles 
    SET 
        total_experience = total_experience + total_experience,
        total_wines_discovered = total_wines_discovered + 1,
        rare_wines_found = rare_wines_found + CASE WHEN wine_entry.rarity_tier IN ('rare', 'epic', 'legendary', 'mythic') THEN 1 ELSE 0 END,
        legendary_wines_found = legendary_wines_found + CASE WHEN wine_entry.rarity_tier IN ('legendary', 'mythic') THEN 1 ELSE 0 END,
        current_streak = current_streak + 1,
        last_activity_date = CURRENT_DATE
    WHERE id = p_user_id;
    
    -- Build rewards response
    rewards := json_build_object(
        'experience_gained', total_experience,
        'base_experience', base_experience,
        'bonus_experience', bonus_experience,
        'rarity_bonus', rarity_bonus,
        'streak_bonus', streak_bonus,
        'is_first_discovery', is_first_global,
        'wine_name', wine_entry.name,
        'rarity_tier', wine_entry.rarity_tier
    );
    
    RETURN rewards;
END;
$$ LANGUAGE plpgsql;