-- WineSnap Database Setup
-- Run this entire script in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable RLS
ALTER DEFAULT PRIVILEGES REVOKE EXECUTE ON FUNCTIONS FROM PUBLIC;

-- Users table (extends auth.users)
CREATE TABLE profiles (
    id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    display_name TEXT,
    avatar_url TEXT,
    bio TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT username_length CHECK (char_length(username) >= 3)
);

-- Wine entries table
CREATE TABLE wine_entries (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    
    -- Basic wine information
    wine_name TEXT NOT NULL,
    producer TEXT,
    vintage INTEGER,
    region TEXT,
    country TEXT,
    grape_varieties TEXT[],
    alcohol_content DECIMAL(3,1),
    price_paid DECIMAL(10,2),
    where_purchased TEXT,
    
    -- WSET Level 3 Appearance
    appearance_intensity TEXT CHECK (appearance_intensity IN ('pale', 'medium-', 'medium', 'medium+', 'deep')),
    appearance_color TEXT,
    appearance_clarity TEXT CHECK (appearance_clarity IN ('clear', 'hazy')),
    appearance_other_observations TEXT,
    
    -- WSET Level 3 Nose
    nose_condition TEXT CHECK (nose_condition IN ('clean', 'unclean')),
    nose_intensity TEXT CHECK (nose_intensity IN ('light', 'medium-', 'medium', 'medium+', 'pronounced')),
    nose_aroma_characteristics TEXT[],
    nose_development TEXT CHECK (nose_development IN ('youthful', 'developing', 'fully developed', 'tired')),
    
    -- WSET Level 3 Palate
    palate_sweetness TEXT CHECK (palate_sweetness IN ('dry', 'off-dry', 'medium-dry', 'medium-sweet', 'sweet', 'luscious')),
    palate_acidity TEXT CHECK (palate_acidity IN ('low', 'medium-', 'medium', 'medium+', 'high')),
    palate_tannin TEXT CHECK (palate_tannin IN ('low', 'medium-', 'medium', 'medium+', 'high')),
    palate_alcohol TEXT CHECK (palate_alcohol IN ('low', 'medium-', 'medium', 'medium+', 'high')),
    palate_body TEXT CHECK (palate_body IN ('light', 'medium-', 'medium', 'medium+', 'full')),
    palate_flavor_intensity TEXT CHECK (palate_flavor_intensity IN ('light', 'medium-', 'medium', 'medium+', 'pronounced')),
    palate_flavor_characteristics TEXT[],
    palate_finish TEXT CHECK (palate_finish IN ('short', 'medium-', 'medium', 'medium+', 'long')),
    
    -- WSET Level 3 Conclusions
    quality_assessment TEXT CHECK (quality_assessment IN ('faulty', 'poor', 'acceptable', 'good', 'very good', 'outstanding')) NOT NULL,
    readiness_for_drinking TEXT CHECK (readiness_for_drinking IN ('too young', 'ready but will improve', 'ready and at peak', 'ready but past peak', 'too old')),
    aging_potential TEXT,
    
    -- Media and additional information
    photo_url TEXT,
    audio_url TEXT,
    voice_transcript TEXT,
    processing_confidence DECIMAL(3,2), -- Confidence score from 0.00 to 1.00
    
    -- Social features
    is_public BOOLEAN DEFAULT true,
    rating INTEGER CHECK (rating >= 1 AND rating <= 100),
    notes TEXT,
    
    -- Timestamps
    tasting_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Wine collections
CREATE TABLE wine_collections (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    is_public BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Wine collection entries (many-to-many)
CREATE TABLE collection_wines (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    collection_id UUID REFERENCES wine_collections(id) ON DELETE CASCADE NOT NULL,
    wine_entry_id UUID REFERENCES wine_entries(id) ON DELETE CASCADE NOT NULL,
    added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(collection_id, wine_entry_id)
);

-- User follows (social feature)
CREATE TABLE user_follows (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    follower_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    following_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(follower_id, following_id),
    CHECK (follower_id != following_id)
);

-- Wine entry likes
CREATE TABLE wine_entry_likes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    wine_entry_id UUID REFERENCES wine_entries(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(user_id, wine_entry_id)
);

-- Wine entry comments
CREATE TABLE wine_entry_comments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    wine_entry_id UUID REFERENCES wine_entries(id) ON DELETE CASCADE NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Activity feed
CREATE TABLE activity_feed (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    activity_type TEXT CHECK (activity_type IN ('wine_entry', 'collection_created', 'follow', 'like', 'comment')) NOT NULL,
    target_id UUID, -- Can reference wine_entries, collections, etc.
    target_user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Voice processing cache (for cost optimization)
CREATE TABLE voice_processing_cache (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    audio_hash TEXT UNIQUE NOT NULL,
    transcript TEXT NOT NULL,
    wset_mapping JSONB NOT NULL,
    processing_confidence DECIMAL(3,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Wine terminology dictionary (for WSET mapping)
CREATE TABLE wine_terminology (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    term TEXT UNIQUE NOT NULL,
    category TEXT NOT NULL, -- 'aroma', 'flavor', 'descriptor', etc.
    wset_field TEXT NOT NULL, -- Maps to specific WSET field
    synonyms TEXT[],
    confidence_weight DECIMAL(3,2) DEFAULT 1.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_wine_entries_user_id ON wine_entries(user_id);
CREATE INDEX idx_wine_entries_created_at ON wine_entries(created_at DESC);
CREATE INDEX idx_wine_entries_public ON wine_entries(is_public) WHERE is_public = true;
CREATE INDEX idx_wine_entries_quality ON wine_entries(quality_assessment);
CREATE INDEX idx_wine_entries_region_country ON wine_entries(region, country);
CREATE INDEX idx_wine_entries_grape_varieties ON wine_entries USING gin(grape_varieties);

CREATE INDEX idx_activity_feed_user_id ON activity_feed(user_id);
CREATE INDEX idx_activity_feed_created_at ON activity_feed(created_at DESC);
CREATE INDEX idx_activity_feed_type ON activity_feed(activity_type);

CREATE INDEX idx_user_follows_follower ON user_follows(follower_id);
CREATE INDEX idx_user_follows_following ON user_follows(following_id);

CREATE INDEX idx_wine_entry_likes_wine ON wine_entry_likes(wine_entry_id);
CREATE INDEX idx_wine_entry_comments_wine ON wine_entry_comments(wine_entry_id);

CREATE INDEX idx_voice_cache_hash ON voice_processing_cache(audio_hash);
CREATE INDEX idx_wine_terminology_term ON wine_terminology(term);
CREATE INDEX idx_wine_terminology_category ON wine_terminology(category);

-- Row Level Security (RLS) policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE wine_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE wine_collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE collection_wines ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE wine_entry_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE wine_entry_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_feed ENABLE ROW LEVEL SECURITY;

-- Policies for profiles
CREATE POLICY "Public profiles are viewable by everyone" ON profiles
    FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile" ON profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

-- Policies for wine_entries
CREATE POLICY "Public wine entries are viewable by everyone" ON wine_entries
    FOR SELECT USING (is_public = true OR user_id = auth.uid());

CREATE POLICY "Users can insert their own wine entries" ON wine_entries
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own wine entries" ON wine_entries
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own wine entries" ON wine_entries
    FOR DELETE USING (auth.uid() = user_id);

-- Policies for wine_collections
CREATE POLICY "Public collections are viewable by everyone" ON wine_collections
    FOR SELECT USING (is_public = true OR user_id = auth.uid());

CREATE POLICY "Users can manage their own collections" ON wine_collections
    FOR ALL USING (auth.uid() = user_id);

-- Policies for collection_wines
CREATE POLICY "Collection wines are viewable by collection owners" ON collection_wines
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM wine_collections 
            WHERE wine_collections.id = collection_wines.collection_id 
            AND (wine_collections.user_id = auth.uid() OR wine_collections.is_public = true)
        )
    );

CREATE POLICY "Users can manage their own collection wines" ON collection_wines
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM wine_collections 
            WHERE wine_collections.id = collection_wines.collection_id 
            AND wine_collections.user_id = auth.uid()
        )
    );

-- Policies for user_follows
CREATE POLICY "User follows are viewable by everyone" ON user_follows
    FOR SELECT USING (true);

CREATE POLICY "Users can follow others" ON user_follows
    FOR INSERT WITH CHECK (auth.uid() = follower_id);

CREATE POLICY "Users can unfollow others" ON user_follows
    FOR DELETE USING (auth.uid() = follower_id);

-- Policies for wine_entry_likes
CREATE POLICY "Wine entry likes are viewable by everyone" ON wine_entry_likes
    FOR SELECT USING (true);

CREATE POLICY "Users can like wine entries" ON wine_entry_likes
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unlike wine entries" ON wine_entry_likes
    FOR DELETE USING (auth.uid() = user_id);

-- Policies for wine_entry_comments
CREATE POLICY "Comments on public wine entries are viewable" ON wine_entry_comments
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM wine_entries 
            WHERE wine_entries.id = wine_entry_comments.wine_entry_id 
            AND (wine_entries.is_public = true OR wine_entries.user_id = auth.uid())
        )
    );

CREATE POLICY "Users can comment on accessible wine entries" ON wine_entry_comments
    FOR INSERT WITH CHECK (
        auth.uid() = user_id AND
        EXISTS (
            SELECT 1 FROM wine_entries 
            WHERE wine_entries.id = wine_entry_comments.wine_entry_id 
            AND (wine_entries.is_public = true OR wine_entries.user_id = auth.uid())
        )
    );

CREATE POLICY "Users can update their own comments" ON wine_entry_comments
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comments" ON wine_entry_comments
    FOR DELETE USING (auth.uid() = user_id);

-- Policies for activity_feed
CREATE POLICY "Users can view activity feed of people they follow" ON activity_feed
    FOR SELECT USING (
        user_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM user_follows 
            WHERE user_follows.follower_id = auth.uid() 
            AND user_follows.following_id = activity_feed.user_id
        )
    );

CREATE POLICY "Users can insert their own activity" ON activity_feed
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Functions and triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Updated at triggers
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_wine_entries_updated_at BEFORE UPDATE ON wine_entries
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_wine_collections_updated_at BEFORE UPDATE ON wine_collections
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_wine_entry_comments_updated_at BEFORE UPDATE ON wine_entry_comments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to create activity feed entries
CREATE OR REPLACE FUNCTION create_activity_feed_entry()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        IF TG_TABLE_NAME = 'wine_entries' THEN
            INSERT INTO activity_feed (user_id, activity_type, target_id, metadata)
            VALUES (NEW.user_id, 'wine_entry', NEW.id, 
                jsonb_build_object('wine_name', NEW.wine_name, 'quality', NEW.quality_assessment));
        ELSIF TG_TABLE_NAME = 'wine_collections' THEN
            INSERT INTO activity_feed (user_id, activity_type, target_id, metadata)
            VALUES (NEW.user_id, 'collection_created', NEW.id, 
                jsonb_build_object('collection_name', NEW.name));
        ELSIF TG_TABLE_NAME = 'user_follows' THEN
            INSERT INTO activity_feed (user_id, activity_type, target_user_id, metadata)
            VALUES (NEW.follower_id, 'follow', NEW.following_id, 
                jsonb_build_object('action', 'started_following'));
        ELSIF TG_TABLE_NAME = 'wine_entry_likes' THEN
            INSERT INTO activity_feed (user_id, activity_type, target_id, metadata)
            VALUES (NEW.user_id, 'like', NEW.wine_entry_id, 
                jsonb_build_object('action', 'liked_wine'));
        ELSIF TG_TABLE_NAME = 'wine_entry_comments' THEN
            INSERT INTO activity_feed (user_id, activity_type, target_id, metadata)
            VALUES (NEW.user_id, 'comment', NEW.wine_entry_id, 
                jsonb_build_object('comment_preview', LEFT(NEW.content, 100)));
        END IF;
        RETURN NEW;
    END IF;
    RETURN NULL;
END;
$$ language 'plpgsql';

-- Activity feed triggers
CREATE TRIGGER create_wine_entry_activity AFTER INSERT ON wine_entries
    FOR EACH ROW EXECUTE FUNCTION create_activity_feed_entry();

CREATE TRIGGER create_collection_activity AFTER INSERT ON wine_collections
    FOR EACH ROW EXECUTE FUNCTION create_activity_feed_entry();

CREATE TRIGGER create_follow_activity AFTER INSERT ON user_follows
    FOR EACH ROW EXECUTE FUNCTION create_activity_feed_entry();

CREATE TRIGGER create_like_activity AFTER INSERT ON wine_entry_likes
    FOR EACH ROW EXECUTE FUNCTION create_activity_feed_entry();

CREATE TRIGGER create_comment_activity AFTER INSERT ON wine_entry_comments
    FOR EACH ROW EXECUTE FUNCTION create_activity_feed_entry();