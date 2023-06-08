using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;

namespace Portfolio.Pages
{
    public class AboutModel : PageModel
    {
        public AboutModel()
        {
            DateTime datum = DateTime.Now;
            TimeSpan leeftijd = datum - new DateTime(2004, 5, 19);
            Leeftijd = (int)Math.Floor(leeftijd.Days / 365f);
        }

        public int Leeftijd { get; set; }

        public void OnGet()
        {
        }
    }
}
