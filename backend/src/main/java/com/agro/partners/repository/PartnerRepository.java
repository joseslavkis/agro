package com.agro.partners.repository;

import com.agro.partners.model.PartnerRequest;
import com.agro.partners.model.PartnerRequestStatus;
import com.agro.user.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface PartnerRepository extends JpaRepository<PartnerRequest, Long> {

    // Check if a request already exists between two users
    @Query("SELECT r FROM PartnerRequest r WHERE (r.sender = :user1 AND r.receiver = :user2) OR (r.sender = :user2 AND r.receiver = :user1)")
    Optional<PartnerRequest> findRequestBetween(@Param("user1") User user1, @Param("user2") User user2);

    List<PartnerRequest> findByReceiverAndStatus(User receiver, PartnerRequestStatus status);

    @Query("SELECT r FROM PartnerRequest r WHERE (r.sender = :user OR r.receiver = :user) AND r.status = 'ACCEPTED'")
    List<PartnerRequest> findAllAcceptedByUser(@Param("user") User user);
}
