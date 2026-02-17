alter table users
    add column username varchar(100) unique,
    alter column email drop not null,
    add column parent_id bigint,
    add column parent_code varchar(50) unique,
    add column level int default 1,
    add column xp int default 0,
    add column reward_points int default 0;

alter table users
    add constraint fk_parent
    foreign key (parent_id)
    references users(id);
