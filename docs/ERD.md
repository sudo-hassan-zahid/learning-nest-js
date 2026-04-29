# Entity Relationship Diagram

```mermaid
erDiagram
    User {
        uuid id PK
        string firstName
        string lastName
        string email UK
        string password
        string avatar
        string bio
        bool isActive
        bool isDeleted
        datetime deletedAt
        datetime createdAt
        datetime updatedAt
    }

    RefreshToken {
        uuid id PK
        string tokenHash
        uuid userId FK
        datetime expiresAt
        datetime createdAt
    }

    Post {
        uuid id PK
        string title
        string slug UK
        text content
        string excerpt
        string coverImage
        enum status
        int viewCount
        uuid authorId FK
        datetime publishedAt
        bool isDeleted
        datetime deletedAt
        datetime createdAt
        datetime updatedAt
    }

    Tag {
        uuid id PK
        string name UK
        string slug UK
        datetime createdAt
    }

    PostTag {
        uuid postId PK,FK
        uuid tagId PK,FK
    }

    Like {
        uuid id PK
        uuid postId FK
        uuid userId FK
        datetime createdAt
    }

    Comment {
        uuid id PK
        text content
        uuid postId FK
        uuid authorId FK
        uuid parentId FK
        bool isDeleted
        datetime createdAt
        datetime updatedAt
    }

    ShareLink {
        uuid id PK
        uuid postId FK
        string shortCode UK
        datetime expiresAt
        datetime createdAt
    }

    Media {
        uuid id PK
        string url
        string publicId
        string mimetype
        int size
        uuid uploadedById FK
        datetime createdAt
    }

    User ||--o{ RefreshToken : "has"
    User ||--o{ Post : "authors"
    User ||--o{ Like : "gives"
    User ||--o{ Comment : "writes"
    User ||--o{ Media : "uploads"

    Post ||--o{ PostTag : "has"
    Post ||--o{ Like : "receives"
    Post ||--o{ Comment : "has"
    Post ||--o{ ShareLink : "has"

    Tag ||--o{ PostTag : "belongs to"

    Comment ||--o{ Comment : "replies (self-ref)"
```

## Relationships

| Relation | Type | Notes |
|---|---|---|
| User → RefreshToken | 1:N | Cascade delete |
| User → Post | 1:N | Author owns posts |
| User → Like | 1:N | Cascade delete |
| User → Comment | 1:N | No cascade (keep thread) |
| User → Media | 1:N | Uploaded files |
| Post → PostTag | 1:N | Cascade delete |
| Post → Like | 1:N | Cascade delete |
| Post → Comment | 1:N | Cascade delete |
| Post → ShareLink | 1:N | Cascade delete |
| Tag → PostTag | 1:N | Cascade delete |
| Comment → Comment | 1:N | Self-referential (parentId), `NoAction` on delete |

## Constraints

- `Like(postId, userId)` — unique together, prevents duplicate likes
- `PostTag(postId, tagId)` — composite PK, prevents duplicate tags on a post
- `ShareLink.shortCode` — unique, indexed for fast lookup
- `Post.slug` — unique, indexed
- `User.email` — unique
- `Tag.slug` — unique
