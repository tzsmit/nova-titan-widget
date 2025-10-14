import { Request, Response, Router } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

/**
 * POST /api/teams - Create or update team
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    const {
      externalId,
      name,
      displayName,
      abbreviation,
      city,
      conference,
      division,
      logo,
      sport,
      league
    } = req.body;

    // Check if team already exists
    const existingTeam = await prisma.team.findUnique({
      where: { externalId }
    });

    if (existingTeam) {
      // Update existing team
      const updatedTeam = await prisma.team.update({
        where: { externalId },
        data: {
          name,
          displayName,
          abbreviation,
          city,
          conference,
          division,
          logo,
          sport,
          league
        }
      });
      return res.json(updatedTeam);
    }

    // Create new team
    const team = await prisma.team.create({
      data: {
        externalId,
        name,
        displayName,
        abbreviation,
        city,
        conference,
        division,
        logo,
        sport,
        league
      }
    });

    res.status(201).json(team);
  } catch (error) {
    console.error('Error creating/updating team:', error);
    res.status(500).json({ error: 'Failed to create/update team' });
  }
});

/**
 * GET /api/teams - Get all teams with optional filters
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const { sport, league, conference } = req.query;
    
    const where: any = {};
    if (sport) where.sport = sport;
    if (league) where.league = league;
    if (conference) where.conference = conference;

    const teams = await prisma.team.findMany({
      where,
      include: {
        players: {
          where: { active: true },
          orderBy: [
            { jersey: 'asc' },
            { name: 'asc' }
          ]
        },
        _count: {
          select: {
            players: true,
            homeGames: true,
            awayGames: true
          }
        }
      },
      orderBy: [
        { sport: 'asc' },
        { league: 'asc' },
        { name: 'asc' }
      ]
    });

    res.json({
      teams,
      total: teams.length,
      sports: [...new Set(teams.map(t => t.sport))],
      leagues: [...new Set(teams.map(t => t.league))]
    });
  } catch (error) {
    console.error('Error fetching teams:', error);
    res.status(500).json({ error: 'Failed to fetch teams' });
  }
});

/**
 * GET /api/teams/:id - Get specific team with full roster
 */
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const team = await prisma.team.findUnique({
      where: { id },
      include: {
        players: {
          where: { active: true },
          orderBy: [
            { jersey: 'asc' },
            { name: 'asc' }
          ]
        },
        homeGames: {
          take: 5,
          orderBy: { startTime: 'desc' },
          include: {
            awayTeam: { select: { name: true, logo: true } }
          }
        },
        awayGames: {
          take: 5,
          orderBy: { startTime: 'desc' },
          include: {
            homeTeam: { select: { name: true, logo: true } }
          }
        }
      }
    });

    if (!team) {
      return res.status(404).json({ error: 'Team not found' });
    }

    res.json(team);
  } catch (error) {
    console.error('Error fetching team:', error);
    res.status(500).json({ error: 'Failed to fetch team' });
  }
});

/**
 * GET /api/teams/by-external/:externalId - Get team by external ESPN ID
 */
router.get('/by-external/:externalId', async (req: Request, res: Response) => {
  try {
    const { externalId } = req.params;
    
    const team = await prisma.team.findUnique({
      where: { externalId },
      include: {
        players: {
          where: { active: true },
          orderBy: [
            { jersey: 'asc' },
            { name: 'asc' }
          ]
        }
      }
    });

    if (!team) {
      return res.status(404).json({ error: 'Team not found' });
    }

    res.json(team);
  } catch (error) {
    console.error('Error fetching team by external ID:', error);
    res.status(500).json({ error: 'Failed to fetch team' });
  }
});

/**
 * DELETE /api/teams/:id - Delete team (and cascade to players)
 */
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    await prisma.team.delete({
      where: { id }
    });

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting team:', error);
    res.status(500).json({ error: 'Failed to delete team' });
  }
});

export default router;