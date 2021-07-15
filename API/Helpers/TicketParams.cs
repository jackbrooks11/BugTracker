namespace API.Helpers
{
    public class TicketParams
    {
        private const int MaxPageSize = 50;
        public int PageNumber { get; set; } = 1;
        private int _pageSize = 10;

        public int PageSize
        {
            get => _pageSize;
            set => _pageSize = (value > MaxPageSize) ? MaxPageSize : value;
        }

        public string OrderBy { get; set; } = "created";
        public bool Ascending { get; set; } = false;
        public string SearchMatch { get; set; } = "";
        public int[] Icons { get; set; } = {0, 0, 0, 0, 0, 0, 2};
        public int Index { get; set; } = 6;
    }
}