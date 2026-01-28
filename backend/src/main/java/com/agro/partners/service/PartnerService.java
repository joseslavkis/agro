package com.agro.partners.service;

import com.agro.partners.dto.PartnerRequestDTO;
import com.agro.partners.model.PartnerRequest;
import com.agro.partners.model.PartnerRequestStatus;
import com.agro.partners.repository.PartnerRepository;
import com.agro.user.User;
import com.agro.user.UserRepository;
import com.agro.user.dto.UserProfileDTO;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class PartnerService {

    private final PartnerRepository partnerRepository;
    private final UserRepository userRepository;

    public PartnerService(PartnerRepository partnerRepository, UserRepository userRepository) {
        this.partnerRepository = partnerRepository;
        this.userRepository = userRepository;
    }

    public void sendInvitation(Long senderId, String receiverUsername) {
        User sender = userRepository.findById(senderId).orElseThrow(() -> new RuntimeException("Sender not found"));
        User receiver = userRepository.findByUsername(receiverUsername)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (sender.getId().equals(receiver.getId())) {
            throw new RuntimeException("You cannot invite yourself");
        }

        if (partnerRepository.findRequestBetween(sender, receiver).isPresent()) {
            throw new RuntimeException("Invitation already exists or you are already partners");
        }

        PartnerRequest request = new PartnerRequest(sender, receiver);
        partnerRepository.save(request);
    }

    public void acceptInvitation(Long userId, Long requestId) {
        PartnerRequest request = partnerRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Request not found"));

        if (!request.getReceiver().getId().equals(userId)) {
            throw new RuntimeException("Not authorized");
        }

        request.setStatus(PartnerRequestStatus.ACCEPTED);
        partnerRepository.save(request);
    }

    public void declineInvitation(Long userId, Long requestId) {
        PartnerRequest request = partnerRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Request not found"));

        if (!request.getReceiver().getId().equals(userId)) {
            throw new RuntimeException("Not authorized");
        }

        request.setStatus(PartnerRequestStatus.DECLINED);
        // Or delete it: partnerRepository.delete(request);
        // Keeping it as declined might be useful, but for now let's just delete to
        // allow re-invite
        partnerRepository.delete(request);
    }

    public List<PartnerRequestDTO> getPendingInvitations(Long userId) {
        User user = userRepository.findById(userId).orElseThrow();
        return partnerRepository.findByReceiverAndStatus(user, PartnerRequestStatus.PENDING).stream()
                .map(r -> new PartnerRequestDTO(
                        r.getId(),
                        r.getSender().getId(),
                        r.getSender().getName() + " " + r.getSender().getLastname(),
                        r.getSender().getAppUsername(),
                        r.getSender().getPhoto(),
                        r.getStatus().name(),
                        r.getCreatedAt()))
                .collect(Collectors.toList());
    }

    public List<UserProfileDTO> getPartners(Long userId) {
        User user = userRepository.findById(userId).orElseThrow();
        return partnerRepository.findAllAcceptedByUser(user).stream()
                .map(r -> {
                    User partner = r.getSender().getId().equals(userId) ? r.getReceiver() : r.getSender();
                    return new UserProfileDTO(
                            partner.getId(),
                            partner.getEmail(),
                            partner.getName(),
                            partner.getLastname(),
                            partner.getPhoto(),
                            partner.getGender(),
                            partner.getBirthDate(),
                            partner.getAppUsername());
                })
                .collect(Collectors.toList());
    }
}
