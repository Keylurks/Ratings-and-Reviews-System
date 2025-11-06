-- Optional seed data for quick testing
INSERT INTO reviews (route_id, commuter_id, rating, title, comment, created_at, updated_at)
VALUES
(1, 1001, 5, 'Great ride', 'On time and clean', NOW(), NOW()),
(1, 1002, 4, 'Good service', 'Slight delay but okay', NOW(), NOW());


