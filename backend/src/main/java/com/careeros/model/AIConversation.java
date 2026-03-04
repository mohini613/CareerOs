package com.careeros.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "ai_conversations")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class AIConversation {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    
    @Column(name = "conversation_type", nullable = false, length = 50)
    private String conversationType;
    
    @Column(length = 200)
    private String title;
    
    @CreationTimestamp
    @Column(name = "started_at", updatable = false)
    private LocalDateTime startedAt;
    
    @UpdateTimestamp
    @Column(name = "last_message_at")
    private LocalDateTime lastMessageAt;
    
    @Column(name = "is_active")
    private Boolean isActive = true;
    
    @Column(name = "message_count")
    private Integer messageCount = 0;
    
    @OneToMany(mappedBy = "conversation", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<AIMessage> messages = new ArrayList<>();
}