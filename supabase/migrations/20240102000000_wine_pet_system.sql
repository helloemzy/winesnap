-- Wine Pet System (Tamagotchi) Database Schema
-- This migration adds the complete pet system for WineSnap

-- Pet species and evolution stages
CREATE TABLE pet_species (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    base_stats JSONB NOT NULL DEFAULT '{"health": 100, "happiness": 100, "energy": 100}',
    evolution_requirements JSONB,
    rarity TEXT CHECK (rarity IN ('common', 'uncommon', 'rare', 'legendary')) DEFAULT 'common',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Pet evolution stages
CREATE TABLE pet_evolution_stages (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    species_id UUID REFERENCES pet_species(id) ON DELETE CASCADE NOT NULL,
    stage_number INTEGER NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    sprite_url TEXT,
    animation_urls JSONB,
    stat_multipliers JSONB NOT NULL DEFAULT '{"health": 1.0, "happiness": 1.0, "energy": 1.0}',
    evolution_requirements JSONB,
    unlocked_abilities TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(species_id, stage_number)
);

-- User pets
CREATE TABLE user_pets (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    species_id UUID REFERENCES pet_species(id) ON DELETE RESTRICT NOT NULL,
    current_evolution_stage UUID REFERENCES pet_evolution_stages(id) ON DELETE RESTRICT NOT NULL,
    name TEXT NOT NULL,
    
    -- Core stats (0-100)
    health INTEGER DEFAULT 100 CHECK (health >= 0 AND health <= 100),
    happiness INTEGER DEFAULT 100 CHECK (happiness >= 0 AND happiness <= 100),
    energy INTEGER DEFAULT 100 CHECK (energy >= 0 AND energy <= 100),
    
    -- Experience and growth
    total_experience INTEGER DEFAULT 0,
    level INTEGER DEFAULT 1,
    
    -- Wine-specific stats
    wine_knowledge_score INTEGER DEFAULT 0,
    regions_discovered TEXT[] DEFAULT '{}',
    grape_varieties_tasted TEXT[] DEFAULT '{}',
    countries_explored TEXT[] DEFAULT '{}',
    rare_wines_encountered INTEGER DEFAULT 0,
    
    -- Skill trees (wine regions expertise)
    french_expertise INTEGER DEFAULT 0 CHECK (french_expertise >= 0 AND french_expertise <= 100),
    italian_expertise INTEGER DEFAULT 0 CHECK (italian_expertise >= 0 AND italian_expertise <= 100),
    spanish_expertise INTEGER DEFAULT 0 CHECK (spanish_expertise >= 0 AND spanish_expertise <= 100),
    german_expertise INTEGER DEFAULT 0 CHECK (german_expertise >= 0 AND german_expertise <= 100),
    new_world_expertise INTEGER DEFAULT 0 CHECK (new_world_expertise >= 0 AND new_world_expertise <= 100),
    
    -- Engagement tracking
    last_fed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_interaction_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    daily_streak INTEGER DEFAULT 0,
    longest_streak INTEGER DEFAULT 0,
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    is_hungry BOOLEAN DEFAULT false,
    is_sleepy BOOLEAN DEFAULT false,
    mood TEXT DEFAULT 'happy' CHECK (mood IN ('very_sad', 'sad', 'neutral', 'happy', 'very_happy', 'ecstatic')),
    
    -- Social features
    battle_wins INTEGER DEFAULT 0,
    battle_losses INTEGER DEFAULT 0,
    prestige_points INTEGER DEFAULT 0,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- User can only have one active pet at a time
    UNIQUE(user_id) WHERE is_active = true
);

-- Pet evolution history (track all evolutions)
CREATE TABLE pet_evolution_history (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    pet_id UUID REFERENCES user_pets(id) ON DELETE CASCADE NOT NULL,
    from_stage UUID REFERENCES pet_evolution_stages(id) ON DELETE RESTRICT,
    to_stage UUID REFERENCES pet_evolution_stages(id) ON DELETE RESTRICT NOT NULL,
    evolved_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    trigger_data JSONB -- What caused the evolution
);

-- Pet activities log
CREATE TABLE pet_activities (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    pet_id UUID REFERENCES user_pets(id) ON DELETE CASCADE NOT NULL,
    activity_type TEXT NOT NULL CHECK (activity_type IN 
        ('fed', 'wine_tasting', 'evolution', 'skill_gain', 'mood_change', 'battle', 'interaction')),
    wine_entry_id UUID REFERENCES wine_entries(id) ON DELETE CASCADE,
    experience_gained INTEGER DEFAULT 0,
    stats_changed JSONB,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Pet battles system
CREATE TABLE pet_battles (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    challenger_pet_id UUID REFERENCES user_pets(id) ON DELETE CASCADE NOT NULL,
    opponent_pet_id UUID REFERENCES user_pets(id) ON DELETE CASCADE NOT NULL,
    battle_type TEXT DEFAULT 'friendly' CHECK (battle_type IN ('friendly', 'ranked', 'tournament')),
    winner_pet_id UUID REFERENCES user_pets(id) ON DELETE CASCADE,
    battle_data JSONB, -- Battle mechanics, rounds, etc.
    experience_reward INTEGER DEFAULT 0,
    prestige_reward INTEGER DEFAULT 0,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    
    CHECK (challenger_pet_id != opponent_pet_id)
);

-- Pet care reminders
CREATE TABLE pet_care_reminders (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    pet_id UUID REFERENCES user_pets(id) ON DELETE CASCADE NOT NULL,
    reminder_type TEXT NOT NULL CHECK (reminder_type IN ('feed', 'interact', 'wine_tasting')),
    scheduled_for TIMESTAMP WITH TIME ZONE NOT NULL,
    sent_at TIMESTAMP WITH TIME ZONE,
    acknowledged_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Wine-to-pet growth mappings
CREATE TABLE wine_pet_growth_mappings (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    
    -- Wine characteristics
    wine_region TEXT,
    wine_country TEXT,
    grape_variety TEXT,
    quality_level TEXT CHECK (quality_level IN ('faulty', 'poor', 'acceptable', 'good', 'very good', 'outstanding')),
    price_tier TEXT CHECK (price_tier IN ('budget', 'mid-range', 'premium', 'super-premium', 'ultra-premium')),
    
    -- Growth effects
    base_experience INTEGER NOT NULL DEFAULT 10,
    health_effect INTEGER DEFAULT 0,
    happiness_effect INTEGER DEFAULT 0,
    energy_effect INTEGER DEFAULT 0,
    
    -- Skill bonuses
    french_expertise_bonus INTEGER DEFAULT 0,
    italian_expertise_bonus INTEGER DEFAULT 0,
    spanish_expertise_bonus INTEGER DEFAULT 0,
    german_expertise_bonus INTEGER DEFAULT 0,
    new_world_expertise_bonus INTEGER DEFAULT 0,
    
    -- Special effects
    rarity_multiplier DECIMAL(3,2) DEFAULT 1.00,
    evolution_catalyst BOOLEAN DEFAULT false,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Pet achievements system
CREATE TABLE pet_achievements (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    description TEXT NOT NULL,
    icon_url TEXT,
    category TEXT NOT NULL CHECK (category IN ('evolution', 'exploration', 'social', 'dedication', 'mastery')),
    requirements JSONB NOT NULL,
    rewards JSONB,
    rarity TEXT CHECK (rarity IN ('common', 'uncommon', 'rare', 'legendary')) DEFAULT 'common',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User pet achievements (earned achievements)
CREATE TABLE user_pet_achievements (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    pet_id UUID REFERENCES user_pets(id) ON DELETE CASCADE NOT NULL,
    achievement_id UUID REFERENCES pet_achievements(id) ON DELETE CASCADE NOT NULL,
    earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(pet_id, achievement_id)
);

-- Pet trading system
CREATE TABLE pet_trades (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    initiator_user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    target_user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    
    -- What's being offered
    offered_items JSONB NOT NULL, -- Can include pet experiences, rare wine discoveries, etc.
    requested_items JSONB NOT NULL,
    
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'cancelled', 'completed')),
    
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CHECK (initiator_user_id != target_user_id)
);

-- Indexes for performance
CREATE INDEX idx_user_pets_user_id ON user_pets(user_id);
CREATE INDEX idx_user_pets_active ON user_pets(is_active) WHERE is_active = true;
CREATE INDEX idx_user_pets_species ON user_pets(species_id);
CREATE INDEX idx_user_pets_level ON user_pets(level DESC);
CREATE INDEX idx_user_pets_prestige ON user_pets(prestige_points DESC);

CREATE INDEX idx_pet_activities_pet_id ON pet_activities(pet_id);
CREATE INDEX idx_pet_activities_type ON pet_activities(activity_type);
CREATE INDEX idx_pet_activities_created_at ON pet_activities(created_at DESC);

CREATE INDEX idx_pet_battles_challenger ON pet_battles(challenger_pet_id);
CREATE INDEX idx_pet_battles_opponent ON pet_battles(opponent_pet_id);
CREATE INDEX idx_pet_battles_completed ON pet_battles(completed_at DESC);

CREATE INDEX idx_wine_growth_mappings_region ON wine_pet_growth_mappings(wine_region);
CREATE INDEX idx_wine_growth_mappings_quality ON wine_pet_growth_mappings(quality_level);

CREATE INDEX idx_pet_care_reminders_pet ON pet_care_reminders(pet_id);
CREATE INDEX idx_pet_care_reminders_scheduled ON pet_care_reminders(scheduled_for);
CREATE INDEX idx_pet_care_reminders_unsent ON pet_care_reminders(sent_at) WHERE sent_at IS NULL;

-- Row Level Security
ALTER TABLE pet_species ENABLE ROW LEVEL SECURITY;
ALTER TABLE pet_evolution_stages ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_pets ENABLE ROW LEVEL SECURITY;
ALTER TABLE pet_evolution_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE pet_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE pet_battles ENABLE ROW LEVEL SECURITY;
ALTER TABLE pet_care_reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE wine_pet_growth_mappings ENABLE ROW LEVEL SECURITY;
ALTER TABLE pet_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_pet_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE pet_trades ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Pet species and evolution stages are public
CREATE POLICY "Pet species are viewable by everyone" ON pet_species FOR SELECT USING (true);
CREATE POLICY "Pet evolution stages are viewable by everyone" ON pet_evolution_stages FOR SELECT USING (true);
CREATE POLICY "Wine growth mappings are viewable by everyone" ON wine_pet_growth_mappings FOR SELECT USING (true);
CREATE POLICY "Pet achievements are viewable by everyone" ON pet_achievements FOR SELECT USING (true);

-- User pets policies
CREATE POLICY "Users can view their own pets" ON user_pets 
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can view public pets for battles/social" ON user_pets 
    FOR SELECT USING (is_active = true);

CREATE POLICY "Users can create their own pets" ON user_pets 
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own pets" ON user_pets 
    FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own pets" ON user_pets 
    FOR DELETE USING (user_id = auth.uid());

-- Pet activities policies
CREATE POLICY "Users can view their pet activities" ON pet_activities 
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_pets 
            WHERE user_pets.id = pet_activities.pet_id 
            AND user_pets.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can log activities for their pets" ON pet_activities 
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM user_pets 
            WHERE user_pets.id = pet_activities.pet_id 
            AND user_pets.user_id = auth.uid()
        )
    );

-- Pet battles policies
CREATE POLICY "Users can view battles involving their pets" ON pet_battles 
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_pets 
            WHERE (user_pets.id = pet_battles.challenger_pet_id OR user_pets.id = pet_battles.opponent_pet_id)
            AND user_pets.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can initiate battles with their pets" ON pet_battles 
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM user_pets 
            WHERE user_pets.id = pet_battles.challenger_pet_id 
            AND user_pets.user_id = auth.uid()
        )
    );

-- Pet care reminders policies
CREATE POLICY "Users can manage their pet care reminders" ON pet_care_reminders 
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_pets 
            WHERE user_pets.id = pet_care_reminders.pet_id 
            AND user_pets.user_id = auth.uid()
        )
    );

-- Pet achievements policies
CREATE POLICY "Users can view their pet achievements" ON user_pet_achievements 
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_pets 
            WHERE user_pets.id = user_pet_achievements.pet_id 
            AND user_pets.user_id = auth.uid()
        )
    );

CREATE POLICY "System can award achievements" ON user_pet_achievements 
    FOR INSERT WITH CHECK (true); -- This will be controlled by application logic

-- Pet trades policies
CREATE POLICY "Users can view trades they're involved in" ON pet_trades 
    FOR SELECT USING (initiator_user_id = auth.uid() OR target_user_id = auth.uid());

CREATE POLICY "Users can initiate trades" ON pet_trades 
    FOR INSERT WITH CHECK (initiator_user_id = auth.uid());

CREATE POLICY "Users can update trades they're involved in" ON pet_trades 
    FOR UPDATE USING (initiator_user_id = auth.uid() OR target_user_id = auth.uid());

-- Update trigger for user_pets
CREATE TRIGGER update_user_pets_updated_at BEFORE UPDATE ON user_pets
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to handle pet stat decay over time
CREATE OR REPLACE FUNCTION decay_pet_stats()
RETURNS void AS $$
DECLARE
    pet_record RECORD;
    hours_since_last_interaction INTEGER;
    decay_amount INTEGER;
BEGIN
    FOR pet_record IN 
        SELECT id, user_id, last_interaction_at, health, happiness, energy 
        FROM user_pets 
        WHERE is_active = true
    LOOP
        hours_since_last_interaction := EXTRACT(EPOCH FROM (NOW() - pet_record.last_interaction_at)) / 3600;
        
        -- Decay stats based on hours since last interaction
        -- Health decays slower, happiness faster
        IF hours_since_last_interaction > 12 THEN
            decay_amount := LEAST(hours_since_last_interaction - 12, 20);
            
            UPDATE user_pets 
            SET 
                happiness = GREATEST(0, happiness - decay_amount * 2),
                energy = GREATEST(0, energy - decay_amount),
                health = GREATEST(0, health - (decay_amount / 2)),
                is_hungry = (hours_since_last_interaction > 24),
                is_sleepy = (hours_since_last_interaction > 48),
                mood = CASE 
                    WHEN happiness > 80 THEN 'very_happy'
                    WHEN happiness > 60 THEN 'happy'
                    WHEN happiness > 40 THEN 'neutral'
                    WHEN happiness > 20 THEN 'sad'
                    ELSE 'very_sad'
                END
            WHERE id = pet_record.id;
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Function to process wine tasting and update pet
CREATE OR REPLACE FUNCTION process_wine_tasting_for_pet(
    p_user_id UUID,
    p_wine_entry_id UUID
)
RETURNS void AS $$
DECLARE
    pet_record RECORD;
    wine_record RECORD;
    growth_mapping RECORD;
    base_exp INTEGER := 10;
    bonus_exp INTEGER := 0;
    new_region BOOLEAN := false;
    new_country BOOLEAN := false;
    new_grape BOOLEAN := false;
BEGIN
    -- Get user's active pet
    SELECT * INTO pet_record FROM user_pets WHERE user_id = p_user_id AND is_active = true;
    IF NOT FOUND THEN
        RETURN; -- No active pet
    END IF;
    
    -- Get wine entry details
    SELECT * INTO wine_record FROM wine_entries WHERE id = p_wine_entry_id;
    IF NOT FOUND THEN
        RETURN; -- Invalid wine entry
    END IF;
    
    -- Check for new discoveries
    new_region := NOT (wine_record.region = ANY(pet_record.regions_discovered));
    new_country := NOT (wine_record.country = ANY(pet_record.countries_explored));
    new_grape := NOT (wine_record.grape_varieties && pet_record.grape_varieties_tasted);
    
    -- Get growth mapping for this wine
    SELECT * INTO growth_mapping 
    FROM wine_pet_growth_mappings 
    WHERE 
        (wine_region = wine_record.region OR wine_region IS NULL) AND
        (wine_country = wine_record.country OR wine_country IS NULL) AND
        (quality_level = wine_record.quality_assessment OR quality_level IS NULL)
    ORDER BY 
        (CASE WHEN wine_region = wine_record.region THEN 1 ELSE 0 END) +
        (CASE WHEN wine_country = wine_record.country THEN 1 ELSE 0 END) +
        (CASE WHEN quality_level = wine_record.quality_assessment THEN 1 ELSE 0 END) DESC
    LIMIT 1;
    
    -- Calculate experience and bonuses
    IF FOUND THEN
        base_exp := growth_mapping.base_experience;
    END IF;
    
    -- New discovery bonuses
    IF new_region THEN bonus_exp := bonus_exp + 20; END IF;
    IF new_country THEN bonus_exp := bonus_exp + 15; END IF;
    IF new_grape THEN bonus_exp := bonus_exp + 10; END IF;
    
    -- Quality bonuses
    bonus_exp := bonus_exp + CASE wine_record.quality_assessment
        WHEN 'outstanding' THEN 25
        WHEN 'very good' THEN 15
        WHEN 'good' THEN 10
        WHEN 'acceptable' THEN 5
        ELSE 0
    END;
    
    -- Update pet stats
    UPDATE user_pets 
    SET 
        total_experience = total_experience + base_exp + bonus_exp,
        wine_knowledge_score = wine_knowledge_score + (base_exp + bonus_exp) / 2,
        regions_discovered = CASE WHEN new_region THEN 
            array_append(regions_discovered, wine_record.region) 
            ELSE regions_discovered END,
        countries_explored = CASE WHEN new_country THEN 
            array_append(countries_explored, wine_record.country) 
            ELSE countries_explored END,
        grape_varieties_tasted = CASE WHEN new_grape THEN 
            grape_varieties_tasted || wine_record.grape_varieties 
            ELSE grape_varieties_tasted END,
        rare_wines_encountered = CASE WHEN wine_record.quality_assessment IN ('very good', 'outstanding') THEN 
            rare_wines_encountered + 1 
            ELSE rare_wines_encountered END,
        
        -- Regional expertise bonuses
        french_expertise = CASE WHEN wine_record.country = 'France' THEN 
            LEAST(100, french_expertise + COALESCE(growth_mapping.french_expertise_bonus, 5))
            ELSE french_expertise END,
        italian_expertise = CASE WHEN wine_record.country = 'Italy' THEN 
            LEAST(100, italian_expertise + COALESCE(growth_mapping.italian_expertise_bonus, 5))
            ELSE italian_expertise END,
        spanish_expertise = CASE WHEN wine_record.country = 'Spain' THEN 
            LEAST(100, spanish_expertise + COALESCE(growth_mapping.spanish_expertise_bonus, 5))
            ELSE spanish_expertise END,
        german_expertise = CASE WHEN wine_record.country = 'Germany' THEN 
            LEAST(100, german_expertise + COALESCE(growth_mapping.german_expertise_bonus, 5))
            ELSE german_expertise END,
        new_world_expertise = CASE WHEN wine_record.country IN ('United States', 'Australia', 'New Zealand', 'South Africa', 'Chile', 'Argentina') THEN 
            LEAST(100, new_world_expertise + COALESCE(growth_mapping.new_world_expertise_bonus, 5))
            ELSE new_world_expertise END,
        
        -- Stat improvements
        health = LEAST(100, health + COALESCE(growth_mapping.health_effect, 5)),
        happiness = LEAST(100, happiness + COALESCE(growth_mapping.happiness_effect, 10)),
        energy = LEAST(100, energy + COALESCE(growth_mapping.energy_effect, 0)),
        
        last_interaction_at = NOW(),
        last_fed_at = NOW(),
        is_hungry = false,
        
        -- Level up logic
        level = CASE WHEN total_experience + base_exp + bonus_exp >= level * 100 THEN level + 1 ELSE level END,
        
        -- Mood improvement
        mood = CASE 
            WHEN happiness + COALESCE(growth_mapping.happiness_effect, 10) >= 90 THEN 'ecstatic'
            WHEN happiness + COALESCE(growth_mapping.happiness_effect, 10) >= 70 THEN 'very_happy'
            ELSE mood
        END
    WHERE id = pet_record.id;
    
    -- Log the activity
    INSERT INTO pet_activities (
        pet_id, 
        activity_type, 
        wine_entry_id, 
        experience_gained, 
        stats_changed,
        metadata
    ) VALUES (
        pet_record.id,
        'wine_tasting',
        p_wine_entry_id,
        base_exp + bonus_exp,
        jsonb_build_object(
            'health', COALESCE(growth_mapping.health_effect, 5),
            'happiness', COALESCE(growth_mapping.happiness_effect, 10),
            'energy', COALESCE(growth_mapping.energy_effect, 0)
        ),
        jsonb_build_object(
            'new_region', new_region,
            'new_country', new_country,
            'new_grape', new_grape,
            'wine_quality', wine_record.quality_assessment
        )
    );
    
END;
$$ LANGUAGE plpgsql;

-- Insert initial pet species
INSERT INTO pet_species (name, description, base_stats, rarity) VALUES 
('Grape Guardian', 'A loyal companion that grows stronger with every wine discovery', '{"health": 100, "happiness": 90, "energy": 100}', 'common'),
('Cellar Sprite', 'A mystical creature that thrives in wine environments', '{"health": 90, "happiness": 100, "energy": 80}', 'uncommon'),
('Vintage Dragon', 'A rare and majestic pet that appreciates only the finest wines', '{"health": 120, "happiness": 80, "energy": 100}', 'rare'),
('Terroir Phoenix', 'A legendary creature that embodies the spirit of great wine regions', '{"health": 150, "happiness": 100, "energy": 120}', 'legendary');

-- Insert evolution stages for Grape Guardian
INSERT INTO pet_evolution_stages (species_id, stage_number, name, description, stat_multipliers, evolution_requirements) VALUES
((SELECT id FROM pet_species WHERE name = 'Grape Guardian'), 1, 'Grape Sprout', 'A tiny sprout beginning its wine journey', '{"health": 1.0, "happiness": 1.0, "energy": 1.0}', '{"level": 1}'),
((SELECT id FROM pet_species WHERE name = 'Grape Guardian'), 2, 'Vine Walker', 'Growing stronger with each tasting', '{"health": 1.2, "happiness": 1.1, "energy": 1.1}', '{"level": 10, "regions_discovered": 3}'),
((SELECT id FROM pet_species WHERE name = 'Grape Guardian'), 3, 'Wine Sage', 'A knowledgeable companion with deep wine wisdom', '{"health": 1.5, "happiness": 1.3, "energy": 1.2}', '{"level": 25, "regions_discovered": 10, "rare_wines": 5}'),
((SELECT id FROM pet_species WHERE name = 'Grape Guardian'), 4, 'Master Sommelier', 'The ultimate wine companion', '{"health": 2.0, "happiness": 1.5, "energy": 1.5}', '{"level": 50, "regions_discovered": 20, "rare_wines": 20, "total_expertise": 300}');

-- Insert sample wine growth mappings
INSERT INTO wine_pet_growth_mappings (wine_region, wine_country, quality_level, base_experience, health_effect, happiness_effect, energy_effect, french_expertise_bonus, italian_expertise_bonus, rarity_multiplier) VALUES
('Bordeaux', 'France', 'outstanding', 35, 10, 15, 5, 10, 0, 1.5),
('Burgundy', 'France', 'outstanding', 40, 8, 20, 3, 12, 0, 1.8),
('Champagne', 'France', 'very good', 30, 5, 25, 10, 8, 0, 1.3),
('Tuscany', 'Italy', 'outstanding', 35, 12, 15, 5, 0, 10, 1.5),
('Piedmont', 'Italy', 'very good', 30, 10, 12, 8, 0, 8, 1.3),
(NULL, NULL, 'outstanding', 25, 5, 10, 0, 0, 0, 1.2), -- Generic outstanding wine
(NULL, NULL, 'very good', 20, 3, 8, 0, 0, 0, 1.1),  -- Generic very good wine
(NULL, NULL, 'good', 15, 2, 5, 0, 0, 0, 1.0),       -- Generic good wine
(NULL, NULL, 'acceptable', 10, 1, 3, 0, 0, 0, 1.0),  -- Generic acceptable wine
(NULL, NULL, 'poor', 5, -2, -5, 0, 0, 0, 0.5);      -- Poor wine has negative effects

-- Insert sample achievements
INSERT INTO pet_achievements (name, description, category, requirements, rewards, rarity) VALUES
('First Taste', 'Complete your first wine tasting', 'dedication', '{"wine_tastings": 1}', '{"experience": 50}', 'common'),
('Region Explorer', 'Discover wines from 5 different regions', 'exploration', '{"regions_discovered": 5}', '{"experience": 100, "prestige": 10}', 'uncommon'),
('World Traveler', 'Taste wines from 10 different countries', 'exploration', '{"countries_explored": 10}', '{"experience": 200, "prestige": 25}', 'rare'),
('Quality Connoisseur', 'Taste 10 outstanding wines', 'mastery', '{"outstanding_wines": 10}', '{"experience": 300, "prestige": 50}', 'rare'),
('French Master', 'Achieve 100 points in French wine expertise', 'mastery', '{"french_expertise": 100}', '{"experience": 500, "prestige": 100}', 'legendary'),
('Social Butterfly', 'Win 10 pet battles', 'social', '{"battle_wins": 10}', '{"experience": 150, "prestige": 30}', 'uncommon'),
('Evolution Master', 'Evolve your pet to the maximum stage', 'evolution', '{"max_evolution": true}', '{"experience": 1000, "prestige": 200}', 'legendary');