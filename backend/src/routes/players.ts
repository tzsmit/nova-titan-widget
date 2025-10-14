import { Request, Response, Router } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

/**
 * POST /api/players - Create or update player
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    const {
      externalId,
      name,
      position,
      jersey,
      height,
      weight,
      age,
      photo,
      teamId,
      active = true
    } = req.body;

    // Find the team by external ID (from ESPN)
    const team = await prisma.team.findUnique({
      where: { externalId: teamId }
    });

    if (!team) {
      return res.status(400).json({ error: `Team with external ID ${teamId} not found` });
    }

    // Check if player already exists
    const existingPlayer = await prisma.player.findUnique({
      where: { externalId }
    });

    if (existingPlayer) {
      // Update existing player
      const updatedPlayer = await prisma.player.update({
        where: { externalId },
        data: {
          name,
          position,
          jersey,
          height,
          weight,
          age,
          photo,
          teamId: team.id, // Use internal team ID
          active
        },
        include: {
          team: {
            select: {
              name: true,
              abbreviation: true,
              logo: true,
              sport: true,
              league: true
            }
          }
        }
      });
      return res.json(updatedPlayer);
    }

    // Create new player
    const player = await prisma.player.create({
      data: {
        externalId,
        name,
        position,
        jersey,
        height,
        weight,
        age,
        photo,
        teamId: team.id, // Use internal team ID
        active
      },
      include: {
        team: {
          select: {
            name: true,
            abbreviation: true,
            logo: true,
            sport: true,
            league: true
          }
        }
      }
    });

    res.status(201).json(player);
  } catch (error) {
    console.error('Error creating/updating player:', error);
    res.status(500).json({ error: 'Failed to create/update player' });
  }
});

/**
 * GET /api/players - Get all players with optional filters
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const { teamId, position, active, sport, league, search } = req.query;
    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 50, 100);
    const skip = (page - 1) * limit;

    const where: any = {};
    
    if (teamId) where.teamId = teamId;
    if (position) where.position = position;
    if (active !== undefined) where.active = active === 'true';
    
    if (sport || league) {
      where.team = {};
      if (sport) where.team.sport = sport;
      if (league) where.team.league = league;
    }

    if (search) {
      where.name = {
        contains: search,
        mode: 'insensitive'
      };
    }

    const [players, total] = await Promise.all([
      prisma.player.findMany({
        where,
        include: {
          team: {
            select: {
              name: true,
              abbreviation: true,
              logo: true,
              sport: true,
              league: true,
              city: true
            }
          }
        },
        orderBy: [
          { team: { sport: 'asc' } },
          { team: { name: 'asc' } },
          { jersey: 'asc' },
          { name: 'asc' }
        ],
        skip,
        take: limit
      }),
      prisma.player.count({ where })
    ]);

    res.json({
      players,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      },
      positions: [...new Set(players.map(p => p.position))],
      sports: [...new Set(players.map(p => p.team.sport))]
    });
  } catch (error) {
    console.error('Error fetching players:', error);
    res.status(500).json({ error: 'Failed to fetch players' });
  }
});

/**
 * GET /api/players/team/:teamId - Get all players for a specific team
 */
router.get('/team/:teamId', async (req: Request, res: Response) => {
  try {
    const { teamId } = req.params;
    const { active = 'true' } = req.query;
    
    const players = await prisma.player.findMany({
      where: {
        teamId,
        active: active === 'true'
      },
      include: {
        team: {
          select: {
            name: true,
            abbreviation: true,
            logo: true,
            sport: true,
            league: true
          }
        }
      },
      orderBy: [
        { jersey: 'asc' },
        { name: 'asc' }
      ]
    });

    // Group players by position for better organization
    const playersByPosition = players.reduce((acc: any, player) => {
      if (!acc[player.position]) {
        acc[player.position] = [];
      }
      acc[player.position].push(player);
      return acc;
    }, {});

    res.json({
      players,
      playersByPosition,
      total: players.length,
      positions: Object.keys(playersByPosition),
      team: players[0]?.team || null
    });
  } catch (error) {
    console.error('Error fetching team players:', error);
    res.status(500).json({ error: 'Failed to fetch team players' });
  }
});

/**
 * GET /api/players/:id - Get specific player
 */
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const player = await prisma.player.findUnique({
      where: { id },
      include: {
        team: {
          select: {
            name: true,
            abbreviation: true,
            logo: true,
            sport: true,
            league: true,
            city: true,
            conference: true,
            division: true
          }
        },
        gameStats: {
          take: 10,
          orderBy: { createdAt: 'desc' },
          include: {
            game: {
              select: {
                startTime: true,
                homeTeam: { select: { name: true, abbreviation: true } },
                awayTeam: { select: { name: true, abbreviation: true } }
              }
            }
          }
        }
      }
    });

    if (!player) {
      return res.status(404).json({ error: 'Player not found' });
    }

    res.json(player);
  } catch (error) {
    console.error('Error fetching player:', error);
    res.status(500).json({ error: 'Failed to fetch player' });
  }
});

/**
 * GET /api/players/by-external/:externalId - Get player by external ESPN ID
 */
router.get('/by-external/:externalId', async (req: Request, res: Response) => {
  try {
    const { externalId } = req.params;
    
    const player = await prisma.player.findUnique({
      where: { externalId },
      include: {
        team: {
          select: {
            name: true,
            abbreviation: true,
            logo: true,
            sport: true,
            league: true
          }
        }
      }
    });

    if (!player) {
      return res.status(404).json({ error: 'Player not found' });
    }

    res.json(player);
  } catch (error) {
    console.error('Error fetching player by external ID:', error);
    res.status(500).json({ error: 'Failed to fetch player' });
  }
});

/**
 * PUT /api/players/:id - Update player
 */
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    const player = await prisma.player.update({
      where: { id },
      data: updateData,
      include: {
        team: {
          select: {
            name: true,
            abbreviation: true,
            logo: true,
            sport: true,
            league: true
          }
        }
      }
    });

    res.json(player);
  } catch (error) {
    console.error('Error updating player:', error);
    res.status(500).json({ error: 'Failed to update player' });
  }
});

/**
 * DELETE /api/players/:id - Delete player
 */
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    await prisma.player.delete({
      where: { id }
    });

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting player:', error);
    res.status(500).json({ error: 'Failed to delete player' });
  }
});

/**
 * GET /api/players/search/:query - Search players by name
 */
router.get('/search/:query', async (req: Request, res: Response) => {
  try {
    const { query } = req.params;
    const { sport, league } = req.query;
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);

    const where: any = {
      name: {
        contains: query,
        mode: 'insensitive'
      }
    };

    if (sport || league) {
      where.team = {};
      if (sport) where.team.sport = sport;
      if (league) where.team.league = league;
    }

    const players = await prisma.player.findMany({
      where,
      include: {
        team: {
          select: {
            name: true,
            abbreviation: true,
            logo: true,
            sport: true,
            league: true
          }
        }
      },
      orderBy: [
        { name: 'asc' }
      ],
      take: limit
    });

    res.json({
      players,
      query,
      total: players.length
    });
  } catch (error) {
    console.error('Error searching players:', error);
    res.status(500).json({ error: 'Failed to search players' });
  }
});

export default router;