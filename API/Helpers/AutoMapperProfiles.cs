using API.DTOs;
using API.Entities;
using AutoMapper;

namespace API.Helpers
{
    public class AutoMapperProfiles : Profile
    {
        public AutoMapperProfiles() {
            CreateMap<RegisterDto, AppUser>();
            CreateMap<AppUser, AppUser>();
            CreateMap<Ticket, Ticket>();
            CreateMap<TicketDto, TicketDto>();
            CreateMap<TicketDto, Ticket>()
                .ForMember(x => x.Assignee, opt => opt.Ignore())
                .ForMember(x => x.Project, opt => opt.Ignore());
            CreateMap<Ticket, TicketDto>()
                    .ForMember(dto => dto.Project, conf => conf.MapFrom(ol => ol.Project.Title))
                    .ForMember(dto => dto.Assignee, conf => conf.MapFrom(ol => ol.Assignee.UserName));
            CreateMap<Project, Project>();
            CreateMap<EditUserDto, AppUser>();
        }
        
    }
}