CREATE TABLE ai_conversations (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    conversation_type VARCHAR(50) NOT NULL, -- Resume_Review, Interview_Prep, Career_Advice, Skill_Gap
    title VARCHAR(200),
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_message_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT true,
    message_count INT DEFAULT 0
);

CREATE TABLE ai_messages (
    id BIGSERIAL PRIMARY KEY,
    conversation_id BIGINT NOT NULL REFERENCES ai_conversations(id) ON DELETE CASCADE,
    role VARCHAR(20) NOT NULL, -- user, assistant, system
    content TEXT NOT NULL,
    metadata JSONB, -- Store AI model, tokens, context, etc.
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_conversations_user_id ON ai_conversations(user_id);
CREATE INDEX idx_conversations_type ON ai_conversations(conversation_type);
CREATE INDEX idx_messages_conversation_id ON ai_messages(conversation_id);
CREATE INDEX idx_messages_created_at ON ai_messages(created_at);