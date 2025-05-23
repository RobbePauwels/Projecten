package service;

import domain.Event;
import domain.User;

import java.util.List;
import java.util.Optional;

public interface UserService {
    Optional<User> findByUsername(String username);
    User save(User user);
    List<Event> getFavorieten(User user);
    boolean isFavoriet(User user, Event event);
    boolean voegFavorietToe(User user, Event event);
    boolean isFavorietenLimietBereikt(User user);
}
