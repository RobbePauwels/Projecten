package service;

import domain.Event;
import domain.User;
import repository.UserRepository;
import service.UserService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Service
@Transactional
public class UserServiceImpl implements UserService {

    private static final int MAX_FAVORIETEN = 1;

    private final UserRepository userRepository;

    public UserServiceImpl(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public Optional<User> findByUsername(String username) {
        return userRepository.findByUsername(username);
    }

    @Override
    public User save(User user) {
        return userRepository.save(user);
    }

    @Override
    public List<Event> getFavorieten(User user) {
        return user.getFavorieten()
                .stream()
                .sorted(Comparator
                        .comparing(Event::getDatumTijd)
                        .thenComparing(Event::getNaam))
                .toList();
    }

    @Override
    public boolean isFavoriet(User user, Event event) {
        return user.getFavorieten().contains(event);
    }

    @Override
    public boolean voegFavorietToe(User user, Event event) {
        if (isFavorietenLimietBereikt(user) || isFavoriet(user, event)) {
            return false;
        }
        user.getFavorieten().add(event);
        userRepository.save(user);
        return true;
    }

    @Override
    public boolean isFavorietenLimietBereikt(User user) {
        return user.getFavorieten().size() >= MAX_FAVORIETEN;
    }
}
