import { Repository } from 'typeorm';
import { AppDataSource } from '../config/database';
import { SupportTicket, TicketStatus } from '../models/SupportTicket';
import { User } from '../models/User';
import { v4 as uuidv4 } from 'uuid';
import logger from '../config/logger';

export class SupportService {
  private supportTicketRepository: Repository<SupportTicket>;
  private userRepository: Repository<User>;

  constructor() {
    this.supportTicketRepository = AppDataSource.getRepository(SupportTicket);
    this.userRepository = AppDataSource.getRepository(User);
  }

  async createSupportTicket(userId: string, message: string): Promise<SupportTicket> {
    try {
      const user = await this.userRepository.findOne({
        where: { user_id: userId, is_active: true }
      });

      if (!user) {
        throw new Error('User not found');
      }

      const ticket = new SupportTicket();
      ticket.ticket_id = uuidv4();
      ticket.user_id = userId;
      ticket.message = message;
      ticket.status = TicketStatus.OPEN;

      const savedTicket = await this.supportTicketRepository.save(ticket);

      logger.info(`Support ticket created: ${ticket.ticket_id}`, { 
        ticketId: ticket.ticket_id, 
        userId, 
        message: message.substring(0, 100) 
      });

      return savedTicket;
    } catch (error) {
      logger.error('Error creating support ticket:', error);
      throw error;
    }
  }

  async getSupportTickets(status?: TicketStatus): Promise<SupportTicket[]> {
    try {
      const whereCondition = status ? { status } : {};
      
      return await this.supportTicketRepository.find({
        where: whereCondition,
        relations: ['user'],
        order: { created_at: 'DESC' }
      });
    } catch (error) {
      logger.error('Error getting support tickets:', error);
      throw error;
    }
  }

  async getSupportTicketById(ticketId: string): Promise<SupportTicket | null> {
    try {
      return await this.supportTicketRepository.findOne({
        where: { ticket_id: ticketId },
        relations: ['user']
      });
    } catch (error) {
      logger.error('Error getting support ticket by ID:', error);
      throw error;
    }
  }

  async getSupportTicketsByUser(userId: string): Promise<SupportTicket[]> {
    try {
      return await this.supportTicketRepository.find({
        where: { user_id: userId },
        order: { created_at: 'DESC' }
      });
    } catch (error) {
      logger.error('Error getting support tickets by user:', error);
      throw error;
    }
  }

  async updateTicketStatus(ticketId: string, status: TicketStatus, adminId?: string): Promise<SupportTicket> {
    try {
      const ticket = await this.getSupportTicketById(ticketId);
      if (!ticket) {
        throw new Error('Support ticket not found');
      }

      ticket.status = status;
      if (adminId) {
        ticket.responded_by = adminId;
        ticket.responded_at = new Date();
      }

      const savedTicket = await this.supportTicketRepository.save(ticket);

      logger.info(`Support ticket status updated: ${ticketId}`, { 
        ticketId, 
        status, 
        adminId 
      });

      return savedTicket;
    } catch (error) {
      logger.error('Error updating ticket status:', error);
      throw error;
    }
  }

  async respondToTicket(ticketId: string, adminId: string, response: string): Promise<SupportTicket> {
    try {
      const ticket = await this.getSupportTicketById(ticketId);
      if (!ticket) {
        throw new Error('Support ticket not found');
      }

      ticket.respond(adminId, response);
      const savedTicket = await this.supportTicketRepository.save(ticket);

      logger.info(`Support ticket responded: ${ticketId}`, { 
        ticketId, 
        adminId, 
        response: response.substring(0, 100) 
      });

      return savedTicket;
    } catch (error) {
      logger.error('Error responding to ticket:', error);
      throw error;
    }
  }

  async getOpenTicketsCount(): Promise<number> {
    try {
      return await this.supportTicketRepository.count({
        where: { status: TicketStatus.OPEN }
      });
    } catch (error) {
      logger.error('Error getting open tickets count:', error);
      throw error;
    }
  }

  async getTicketsStats(): Promise<{
    total: number;
    open: number;
    inProgress: number;
    closed: number;
  }> {
    try {
      const [total, open, inProgress, closed] = await Promise.all([
        this.supportTicketRepository.count(),
        this.supportTicketRepository.count({ where: { status: TicketStatus.OPEN } }),
        this.supportTicketRepository.count({ where: { status: TicketStatus.IN_PROGRESS } }),
        this.supportTicketRepository.count({ where: { status: TicketStatus.CLOSED } }),
      ]);

      return { total, open, inProgress, closed };
    } catch (error) {
      logger.error('Error getting tickets stats:', error);
      throw error;
    }
  }
}
