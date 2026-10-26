// -----------------------------------------------------------------------------
// JSON helpers
// -----------------------------------------------------------------------------

function toJson(value) {
  return JSON.stringify(
    value ?? [],
  )
}

function fromJson(value) {
  return JSON.parse(
    value ?? '[]',
  )
}

// -----------------------------------------------------------------------------
// Row mapping
// -----------------------------------------------------------------------------

function rowToGame(row) {
  return {
    id: row.id,

    source: {
      provider:
        row.source_provider,

      externalId:
        row.source_external_id,
    },

    title: row.title,

    description:
      row.description,

    yearPublished:
      row.year_published,

    images: {
      thumbnailUrl:
        row.thumbnail_url,

      imageUrl:
        row.image_url,
    },

    playerRange: {
      min: row.min_players,
      max: row.max_players,
    },

    playTime: {
      minMinutes:
        row.min_play_minutes,

      maxMinutes:
        row.max_play_minutes,
    },

    age: {
      publisherMinimum:
        row.publisher_min_age,

      communityPoll:
        fromJson(
          row.community_age_poll_json,
        ),
    },

    complexity: {
      average:
        row.complexity_average,
    },

    playerCountPoll:
      fromJson(
        row.player_count_poll_json,
      ),

    mechanics:
      fromJson(
        row.mechanics_json,
      ),

    categories:
      fromJson(
        row.categories_json,
      ),

    ratings: {
      bayesianAverage:
        row.bayesian_average,

      usersRated:
        row.users_rated,
    },

    relationships: {
      baseGameIds:
        fromJson(
          row.base_game_ids_json,
        ),
    },

    content: {
      classification:
        row.content_classification,
    },
  }
}

// -----------------------------------------------------------------------------
// Catalogue repository
// -----------------------------------------------------------------------------

function createCatalogueRepository({
  db,
}) {
  const upsertGameStatement =
    db.prepare(`
      INSERT INTO games (
        id,
        source_provider,
        source_external_id,
        title,
        description,
        year_published,
        thumbnail_url,
        image_url,
        min_players,
        max_players,
        min_play_minutes,
        max_play_minutes,
        publisher_min_age,
        complexity_average,
        bayesian_average,
        users_rated,
        community_age_poll_json,
        player_count_poll_json,
        mechanics_json,
        categories_json,
        base_game_ids_json
      )
      VALUES (
        ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
      )
      ON CONFLICT(id)
      DO UPDATE SET
        source_provider =
          excluded.source_provider,

        source_external_id =
          excluded.source_external_id,

        title =
          excluded.title,

        description =
          excluded.description,

        year_published =
          excluded.year_published,

        thumbnail_url =
          excluded.thumbnail_url,

        image_url =
          excluded.image_url,

        min_players =
          excluded.min_players,

        max_players =
          excluded.max_players,

        min_play_minutes =
          excluded.min_play_minutes,

        max_play_minutes =
          excluded.max_play_minutes,

        publisher_min_age =
          excluded.publisher_min_age,

        complexity_average =
          excluded.complexity_average,

        bayesian_average =
          excluded.bayesian_average,

        users_rated =
          excluded.users_rated,

        community_age_poll_json =
          excluded.community_age_poll_json,

        player_count_poll_json =
          excluded.player_count_poll_json,

        mechanics_json =
          excluded.mechanics_json,

        categories_json =
          excluded.categories_json,

        base_game_ids_json =
          excluded.base_game_ids_json
    `)

  const upsertCatalogueEntryStatement =
    db.prepare(`
      INSERT INTO catalogue_entries (
        game_id,
        content_classification,
        imported_at
      )
      VALUES (?, ?, ?)
      ON CONFLICT(game_id)
      DO UPDATE SET
        imported_at =
          excluded.imported_at
    `)

  const getIncludedGamesStatement =
    db.prepare(`
      SELECT
        games.*,
        catalogue_entries.content_classification
      FROM games
      INNER JOIN catalogue_entries
        ON catalogue_entries.game_id =
          games.id
      WHERE
        catalogue_entries.is_included = 1
      ORDER BY
        games.title,
        games.id
    `)

  function upsertGame(
    game,
    {
      importedAt,
    },
  ) {
    db.exec('BEGIN')

    try {
      upsertGameStatement.run(
        game.id,

        game.source.provider,
        game.source.externalId,

        game.title,
        game.description,
        game.yearPublished,

        game.images.thumbnailUrl,
        game.images.imageUrl,

        game.playerRange.min,
        game.playerRange.max,

        game.playTime.minMinutes,
        game.playTime.maxMinutes,

        game.age.publisherMinimum,

        game.complexity.average,

        game.ratings.bayesianAverage,
        game.ratings.usersRated,

        toJson(
          game.age.communityPoll,
        ),

        toJson(
          game.playerCountPoll,
        ),

        toJson(
          game.mechanics,
        ),

        toJson(
          game.categories,
        ),

        toJson(
          game.relationships.baseGameIds,
        ),
      )

      upsertCatalogueEntryStatement.run(
        game.id,

        game.content
          ?.classification ??
          'unknown',

        importedAt,
      )

      db.exec('COMMIT')
    } catch (error) {
      db.exec('ROLLBACK')

      throw error
    }
  }

  function getIncludedGames() {
    return getIncludedGamesStatement
      .all()
      .map(rowToGame)
  }

  return {
    upsertGame,
    getIncludedGames,
  }
}

// -----------------------------------------------------------------------------
// Module exports
// -----------------------------------------------------------------------------

module.exports = {
  createCatalogueRepository,
}