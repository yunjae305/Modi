package com.modi.repository;

import com.modi.domain.AuthProvider;
import com.modi.domain.UserAccount;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserAccountRepository extends JpaRepository<UserAccount, Long> {

    Optional<UserAccount> findByProviderAndProviderId(AuthProvider provider, String providerId);
}
