using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using System.Security.Principal;

namespace Portfolio.Pages
{
    public class IndexModel : PageModel
    {
        private readonly ILogger<IndexModel> _logger;

        public IndexModel(ILogger<IndexModel> logger)
        {
            Naam = "Robin de Veer";
            DateTime datum = DateTime.Now;
            TimeSpan leeftijd = datum - new DateTime(2004, 5, 19);
            Leeftijd = (int)Math.Floor(leeftijd.Days/365f);
            _logger = logger;
        }

        public string Naam { get; set; }
        public int Leeftijd { get; set; }

        public void OnGet()
        {

        }
    }
}