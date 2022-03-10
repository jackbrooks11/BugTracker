using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using API.Data;
using API.DTOs;
using API.Entities;
using API.Helpers;
using API.Interfaces;
using AutoMapper;
using AutoMapper.QueryableExtensions;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;

namespace API.Services
{
    public class TicketService : ITicketService
    {
        private readonly DataContext _context;
        private readonly IMapper _mapper;
        public TicketService(IMapper mapper, DataContext context)
        {
            _context = context;
            _mapper = mapper;
        }
        public async Task<Ticket> GetTicket(int id)
        {
            return await _context.Tickets
                .Include(p => p.Project)
                .Include(a => a.Assignee)
                .Include(x => x.Comments)
                .Include(c => c.Changes)
                .FirstOrDefaultAsync(y => y.Id == id);
        }
        public async Task<TicketDto> GetTicketAsDto(int id)
        {
            var ticket = await _context.Tickets.AsNoTracking()
                .Include(p => p.Project)
                .Include(a => a.Assignee)
                .Include(x => x.Comments)
                .Include(c => c.Changes)
                .FirstOrDefaultAsync(y => y.Id == id);
            var ticketDto = new TicketDto();
            _mapper.Map(ticket, ticketDto);
            if (ticketDto.Assignee == null)
            {
                ticketDto.Assignee = "";
            }
            return ticketDto;
        }
        public IEnumerable<TicketDto> GetTicketsAsDtos()
        {
            var tickets = _context.Tickets.AsNoTracking()
                .Include(p => p.Project)
                .Include(a => a.Assignee)
                .Include(x => x.Comments)
                .Include(c => c.Changes);
            IList<TicketDto> ticketDtos = new List<TicketDto>();
            foreach (var ticket in tickets)
            {
                var ticketDto = new TicketDto();
                _mapper.Map(ticket, ticketDto);
                ticketDtos.Add(ticketDto);
            }
            return ticketDtos;
        }
        public async Task<PagedList<TicketDto>> GetTicketsPaginated(TicketParams ticketParams)
        {
            IQueryable<Ticket> ticketQuery = GetTicketQuery(ticketParams);
            IQueryable<TicketDto> ticketDtoQuery = ticketQuery
                .ProjectTo<TicketDto>(_mapper.ConfigurationProvider);
            return await PagedList<TicketDto>.CreateAsync(ticketDtoQuery, ticketParams.PageNumber, ticketParams.PageSize);
        }
        public async Task<PagedList<TicketDto>> GetTicketsForUser(TicketParams ticketParams, string username)
        {
            var query = GetTicketQuery(ticketParams);
            query = query.Where(t => t.Assignee.UserName.ToLower() == username.ToLower());
            var testing = query
                .ProjectTo<TicketDto>(_mapper.ConfigurationProvider);
            return await PagedList<TicketDto>.CreateAsync(testing, ticketParams.PageNumber, ticketParams.PageSize);
        }
        public async Task<PagedList<TicketDto>> GetTicketsForProject(TicketParams ticketParams, string projectTitle)
        {
            var query = GetTicketQuery(ticketParams);
            query = query.Where(t => t.Project.Title.ToLower() == projectTitle.ToLower());
            var testing = query
                .ProjectTo<TicketDto>(_mapper.ConfigurationProvider);
            return await PagedList<TicketDto>.CreateAsync(testing, ticketParams.PageNumber, ticketParams.PageSize);
        }
        public void DeleteTickets(int[] ticketIdsToDelete)
        {
            var ticketsToDelete = GetTicketsToDelete(ticketIdsToDelete);
            foreach (var ticket in ticketsToDelete)
            {
                _context.Remove(ticket);
            };
        }
        public async Task<string> ValidateTicket(TicketDto ticketDto, Project project)
        {
            if (project == null)
            {

                return "Project does not exist.";
            }
            if (ticketDto.Project == "")
            {
                return "Project field can not be empty.";
            }
            var userBelongsToProject = await _context.ProjectUsers.AsNoTracking().AnyAsync(pu => pu.ProjectId == project.Id && pu.User.UserName.ToLower() == ticketDto.Assignee.ToLower());

            var userExists = await _context.Users.AsNoTracking().AnyAsync(x => x.UserName == ticketDto.Assignee);
            if (!userBelongsToProject && userExists && ticketDto.Assignee != "")
            {
                return "User assigned to ticket does not belong to project.";
            }

            if (!userBelongsToProject && !userExists && ticketDto.Assignee != "")
            {
                return "User assigned to ticket does not exist.";
            }
            if (ticketDto.Title.Length == 0)
            {
                return "Ticket must have a title.";
            }
            if (ticketDto.Description.Length == 0)
            {
                return "Ticket must have a description.";
            }
            return "";
        }
        public TicketDto AddChangesToTicket(TicketDto existingTicketDto, TicketDto newTicketDto, string editor)
        {
            if (existingTicketDto.Title.ToLower() != newTicketDto.Title.ToLower())
            {
                newTicketDto = AddChangeToTicket(existingTicketDto, newTicketDto, "Title", editor);
            }
            if (existingTicketDto.Description != newTicketDto.Description)
            {
                newTicketDto = AddChangeToTicket(existingTicketDto, newTicketDto, "Description", editor);
            }
            if (existingTicketDto.Type != newTicketDto.Type)
            {
                newTicketDto = AddChangeToTicket(existingTicketDto, newTicketDto, "Type", editor);
            }
            if (existingTicketDto.Project != newTicketDto.Project)
            {
                newTicketDto = AddChangeToTicket(existingTicketDto, newTicketDto, "Project", editor);
            }
            if (existingTicketDto.Priority != newTicketDto.Priority)
            {
                newTicketDto = AddChangeToTicket(existingTicketDto, newTicketDto, "Priority", editor);
            }
            if (existingTicketDto.State != newTicketDto.State)
            {
                newTicketDto = AddChangeToTicket(existingTicketDto, newTicketDto, "State", editor);
            }
            if (existingTicketDto.Assignee != newTicketDto.Assignee)
            {
                newTicketDto = AddChangeToTicket(existingTicketDto, newTicketDto, "Assignee", editor);
            }
            _mapper.Map(newTicketDto, existingTicketDto);
            existingTicketDto.LastEdited = DateTime.Now;
            return existingTicketDto;
        }
        public TicketDto AddChangeToTicket(TicketDto existingTicketDto, TicketDto newTicketDto, string property, string editor)
        {
            TicketPropertyChange change = new TicketPropertyChange();
            change.Property = property;
            change.Editor = editor;
            change.Changed = DateTime.Now;
            if (property == "Title")
            {
                change.OldValue = existingTicketDto.Title;
                change.NewValue = newTicketDto.Title;
            }
            else if (property == "Description")
            {
                change.OldValue = existingTicketDto.Description;
                change.NewValue = newTicketDto.Description;
            }
            else if (property == "Type")
            {
                change.OldValue = existingTicketDto.Type;
                change.NewValue = newTicketDto.Type;
            }
            else if (property == "Project")
            {
                change.OldValue = existingTicketDto.Project;
                change.NewValue = newTicketDto.Project;
            }
            else if (property == "Priority")
            {
                change.OldValue = existingTicketDto.Priority;
                change.NewValue = newTicketDto.Priority;
            }
            else if (property == "State")
            {
                change.OldValue = existingTicketDto.State;
                change.NewValue = newTicketDto.State;
            }
            else if (property == "Assignee")
            {
                change.OldValue = existingTicketDto.Assignee;
                change.NewValue = newTicketDto.Assignee;
                if (change.OldValue == "" || change.OldValue == null) {
                    change.OldValue = "Unassigned";
                }
                 if (change.NewValue == "" || change.NewValue == null) {
                    change.NewValue = "Unassigned";
                }
            }
            change.TicketId = existingTicketDto.Id;
            newTicketDto.Changes.Add(change);
            return newTicketDto;
        }
        private IEnumerable<Ticket> GetTicketsToDelete(int[] ticketIdsToDelete)
        {
            return _context.Tickets.Where(t => ticketIdsToDelete.Contains(t.Id)).AsNoTracking();
        }
        private IQueryable<Ticket> GetTicketQuery(TicketParams ticketParams)
        {
            var query = _context.Tickets
                .Include(p => p.Project)
                .Include(a => a.Assignee)
                .Include(t => t.Comments)
                .Include(x => x.Changes)
                .AsNoTracking();
            if (ticketParams.SearchMatch != null)
            {
                query = query.Where(t => (t.Title.ToLower().Contains(ticketParams.SearchMatch.ToLower()) ||
                t.Title.ToLower().Contains(ticketParams.SearchMatch.ToLower()) ||
                t.Assignee.UserName.ToLower().Contains(ticketParams.SearchMatch.ToLower())));
            }
            if (!ticketParams.Ascending)
            {
                query = ticketParams.OrderBy switch
                {
                    "title" => query.OrderByDescending(t => t.Title),
                    "project" => query.OrderByDescending(t => t.Project.Title),
                    "assignee" => query.OrderByDescending(t => t.Assignee.UserName),
                    "priority" => query.OrderByDescending(t => (t.Priority == "High" ? 3 :
                    t.Priority == "Medium" ? 2 :
                    1)),
                    "state" => query.OrderByDescending(t => t.State),
                    "type" => query.OrderByDescending(t => t.Type),
                    _ => query.OrderByDescending(t => t.Created)
                };
            }
            else
            {
                query = ticketParams.OrderBy switch
                {
                    "title" => query.OrderBy(t => t.Title),
                    "project" => query.OrderBy(t => t.Project.Title),
                    "assignee" => query.OrderBy(t => t.Assignee.UserName),
                    "priority" => query.OrderBy(t => (t.Priority == "High" ? 3 :
                    t.Priority == "Medium" ? 2 :
                    1)),
                    "state" => query.OrderBy(t => t.State),
                    "type" => query.OrderBy(t => t.Type),
                    _ => query.OrderBy(t => t.Created)
                };
            }
            return query;
        }
        public void MarkTicketAsModified(Ticket ticket)
        {
            _context.Entry(ticket).State = EntityState.Modified;
        }
        public void AddTicket(Ticket ticket)
        {
            _context.Tickets.Add(ticket);
            _context.Entry(ticket).State = EntityState.Added;
        }

        public Ticket MapTicket(TicketDto ticketDto, Ticket ticket)
        {
            _mapper.Map(ticketDto, ticket);
            return ticket;
        }
        public async Task<bool> SaveAllAsync()
        {
            return await _context.SaveChangesAsync() > 0;
        }
    }
}