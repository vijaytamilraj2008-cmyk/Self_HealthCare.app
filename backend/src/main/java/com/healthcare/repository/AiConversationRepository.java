package com.healthcare.repository;

import com.healthcare.entity.AiConversation;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface AiConversationRepository extends JpaRepository<AiConversation, String> {
    List<AiConversation> findByUserIdOrderByUpdatedAtDesc(String userId);
}
