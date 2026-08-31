using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using PeaceInternational.Core.Entity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace PeaceInternational.Infrastructure;

internal static class DemoDataSeeder
{
    private static readonly DateTime SeedCreatedDate = new(2026, 8, 1, 9, 0, 0);

    public static async Task SeedAsync(
        ApplicationDbContext db,
        UserManager<IdentityUser> userManager,
        string createdBy,
        string userPassword)
    {
        await SeedUsersAsync(userManager, userPassword);

        var fiscalYear = await db.Set<FiscalYear>()
            .SingleAsync(fiscalYear => fiscalYear.Name == "83/84");

        var hotels = await SeedHotelsAsync(db, createdBy);
        var guides = await SeedGuidesAsync(db, createdBy);
        var sectors = await SeedSectorsAsync(db, createdBy);
        var transports = await SeedTransportsAsync(db, createdBy);

        await SeedSectorTransportRatesAsync(db, sectors, transports, createdBy);

        var customers = await SeedCustomersAsync(db, fiscalYear, createdBy);
        await SeedInvoicesAsync(db, fiscalYear, customers, createdBy);
        await SeedServiceVouchersAsync(db, fiscalYear, customers, hotels, createdBy);
        await SeedTourCostsAsync(db, guides, sectors, hotels, createdBy);
    }

    private static async Task SeedUsersAsync(UserManager<IdentityUser> userManager, string password)
    {
        await EnsureUserAsync(userManager, "operations.demo", "operations@peaceinternational.example", "+44 20 7946 0140", password);
        await EnsureUserAsync(userManager, "accounts.demo", "accounts@peaceinternational.example", "+44 20 7946 0141", password);
        await EnsureUserAsync(userManager, "reservations.demo", "reservations@peaceinternational.example", "+44 20 7946 0142", password);
        await EnsureUserAsync(userManager, "sales.demo", "sales@peaceinternational.example", "+44 20 7946 0143", password);
        await EnsureUserAsync(userManager, "groups.demo", "groups@peaceinternational.example", "+44 20 7946 0144", password);
        await EnsureUserAsync(userManager, "hotels.demo", "hotels@peaceinternational.example", "+44 20 7946 0145", password);
        await EnsureUserAsync(userManager, "transport.demo", "transport@peaceinternational.example", "+44 20 7946 0146", password);
        await EnsureUserAsync(userManager, "guides.demo", "guides@peaceinternational.example", "+44 20 7946 0147", password);
        await EnsureUserAsync(userManager, "finance.demo", "finance@peaceinternational.example", "+44 20 7946 0148", password);
    }

    private static async Task EnsureUserAsync(
        UserManager<IdentityUser> userManager,
        string username,
        string email,
        string phoneNumber,
        string password)
    {
        var user = await userManager.FindByNameAsync(username);
        if (user == null)
        {
            user = new IdentityUser
            {
                UserName = username,
                Email = email,
                EmailConfirmed = true,
                PhoneNumber = phoneNumber,
                LockoutEnabled = false
            };

            var createResult = await userManager.CreateAsync(user, password);
            ThrowIfFailed(createResult, $"create demo user '{username}'");
        }

        if (!await userManager.IsInRoleAsync(user, "USER"))
        {
            var roleResult = await userManager.AddToRoleAsync(user, "USER");
            ThrowIfFailed(roleResult, $"assign USER role to demo user '{username}'");
        }
    }

    private static async Task<Dictionary<string, Hotel>> SeedHotelsAsync(
        ApplicationDbContext db,
        string createdBy)
    {
        var definitions = new[]
        {
            new HotelDefinition("Orient Jerusalem Hotel", "+972 2 555 4100", "23 Jaffa Road, Jerusalem", "ORJ", 'A', 185m, 250m, 65m, 42m, 28m),
            new HotelDefinition("Nevo Dead Sea Resort", "+972 8 555 2200", "Ein Bokek Promenade, Dead Sea", "NDS", 'A', 210m, 285m, 75m, 48m, 32m),
            new HotelDefinition("Manger Square Hotel", "+970 2 555 1300", "12 Manger Square, Bethlehem", "MSH", 'B', 125m, 175m, 45m, 34m, 22m),
            new HotelDefinition("Galilee Courtyard Hotel", "+972 4 555 3600", "18 Paulus Street, Nazareth", "GCH", 'B', 135m, 190m, 48m, 36m, 24m),
            new HotelDefinition("Jericho Oasis Inn", "+970 2 555 4700", "7 Hisham's Palace Road, Jericho", "JOI", 'C', 92m, 132m, 35m, 28m, 18m),
            new HotelDefinition("Lake View Guesthouse", "+972 4 555 5800", "4 Gdud Barak Street, Tiberias", "LVG", 'C', 98m, 140m, 38m, 29m, 19m),
            new HotelDefinition("Mamilla Garden Hotel", "+972 2 555 6110", "8 Shlomo HaMelekh Street, Jerusalem", "MGH", 'A', 225m, 310m, 85m, 52m, 35m),
            new HotelDefinition("Carmel Heights Resort", "+972 4 555 6220", "27 Yefe Nof Street, Haifa", "CHR", 'A', 205m, 275m, 72m, 46m, 31m),
            new HotelDefinition("Sea of Galilee Grand", "+972 4 555 6330", "15 HaBanim Promenade, Tiberias", "SGG", 'A', 215m, 295m, 78m, 49m, 33m),
            new HotelDefinition("Mount Zion Boutique", "+972 2 555 6440", "11 Hebron Road, Jerusalem", "MZB", 'A', 195m, 265m, 70m, 45m, 30m),
            new HotelDefinition("Bethlehem Heritage House", "+970 2 555 6550", "6 Star Street, Bethlehem", "BHH", 'B', 118m, 168m, 43m, 33m, 21m),
            new HotelDefinition("Nazareth Olive Hotel", "+972 4 555 6660", "20 Al-Bishara Street, Nazareth", "NOH", 'B', 128m, 182m, 46m, 35m, 23m),
            new HotelDefinition("Acre Harbour Hotel", "+972 4 555 6770", "3 Old Port Lane, Acre", "AHH", 'B', 142m, 198m, 50m, 38m, 25m),
            new HotelDefinition("Mount Tabor Lodge", "+972 4 555 6880", "2 Tabor Village Road, Kfar Tavor", "MTL", 'B', 122m, 172m, 44m, 34m, 22m),
            new HotelDefinition("Jericho Palm Guesthouse", "+970 2 555 6990", "19 Ein Sultan Road, Jericho", "JPG", 'C', 88m, 126m, 33m, 27m, 17m),
            new HotelDefinition("Cana Village Inn", "+972 4 555 7100", "5 Church Street, Kafr Kanna", "CVI", 'C', 84m, 120m, 32m, 26m, 17m),
            new HotelDefinition("Haifa Bay Guesthouse", "+972 4 555 7210", "33 Ben Gurion Avenue, Haifa", "HBG", 'C', 102m, 146m, 39m, 30m, 20m),
            new HotelDefinition("Ein Karem Pilgrim House", "+972 2 555 7320", "9 Spring Lane, Ein Karem", "EKP", 'C', 90m, 130m, 34m, 27m, 18m)
        };

        var hotels = (await db.Set<Hotel>().ToListAsync())
            .GroupBy(hotel => hotel.Code, StringComparer.OrdinalIgnoreCase)
            .ToDictionary(group => group.Key, group => group.First(), StringComparer.OrdinalIgnoreCase);

        foreach (var definition in definitions)
        {
            if (hotels.ContainsKey(definition.Code))
            {
                continue;
            }

            var hotel = new Hotel
            {
                Name = definition.Name,
                PhoneNo = definition.PhoneNo,
                Address = definition.Address,
                Code = definition.Code,
                Category = definition.Category,
                CreatedBy = createdBy,
                CreatedDate = SeedCreatedDate
            };
            db.Add(hotel);
            hotels.Add(definition.Code, hotel);
        }

        await db.SaveChangesAsync();

        var ratesByHotel = (await db.Set<HotelRoomRate>().ToListAsync())
            .GroupBy(rate => rate.HotelId)
            .ToDictionary(group => group.Key, group => group.First());

        foreach (var definition in definitions)
        {
            var hotel = hotels[definition.Code];
            if (ratesByHotel.ContainsKey(hotel.Id))
            {
                continue;
            }

            db.Add(new HotelRoomRate
            {
                HotelId = hotel.Id,
                SingleBed = definition.SingleBed,
                DoubleBed = definition.DoubleBed,
                ExtraBed = definition.ExtraBed,
                AP = definition.Ap,
                MAP = definition.Map,
                CreatedBy = createdBy,
                CreatedDate = SeedCreatedDate
            });
        }

        await db.SaveChangesAsync();
        return hotels;
    }

    private static async Task<Dictionary<string, Guide>> SeedGuidesAsync(
        ApplicationDbContext db,
        string createdBy)
    {
        var definitions = new[]
        {
            new GuideDefinition("Youssef Ibrahim", 175, 95, 225),
            new GuideDefinition("Sarah Cohen", 185, 100, 235),
            new GuideDefinition("Omar Khalil", 165, 90, 215),
            new GuideDefinition("Rachel Levy", 180, 98, 230),
            new GuideDefinition("Miriam Haddad", 170, 92, 220),
            new GuideDefinition("Daniel Ben-Ami", 188, 102, 238),
            new GuideDefinition("Layla Nassar", 172, 94, 222),
            new GuideDefinition("Elias Khoury", 168, 91, 218),
            new GuideDefinition("Noa Shalev", 182, 99, 232),
            new GuideDefinition("Samir Awad", 166, 90, 216),
            new GuideDefinition("Rebecca Gold", 190, 104, 240),
            new GuideDefinition("George Mansour", 174, 95, 224),
            new GuideDefinition("Hana Saleh", 176, 96, 226),
            new GuideDefinition("David Rosen", 186, 101, 236),
            new GuideDefinition("Leila Yacoub", 171, 93, 221)
        };

        var guides = (await db.Set<Guide>().ToListAsync())
            .GroupBy(guide => guide.Name, StringComparer.OrdinalIgnoreCase)
            .ToDictionary(group => group.Key, group => group.First(), StringComparer.OrdinalIgnoreCase);

        foreach (var definition in definitions)
        {
            if (guides.ContainsKey(definition.Name))
            {
                continue;
            }

            var guide = new Guide
            {
                Name = definition.Name,
                FullDayRate = definition.FullDayRate,
                HalfDayRate = definition.HalfDayRate,
                OverNight = definition.OvernightRate,
                CreatedBy = createdBy,
                CreatedDate = SeedCreatedDate
            };
            db.Add(guide);
            guides.Add(definition.Name, guide);
        }

        await db.SaveChangesAsync();
        return guides;
    }

    private static async Task<Dictionary<string, Sector>> SeedSectorsAsync(
        ApplicationDbContext db,
        string createdBy)
    {
        var definitions = new[]
        {
            new SectorDefinition("Airport to Jerusalem", "TLV-JRS"),
            new SectorDefinition("Jerusalem City Tour", "JRS-CITY"),
            new SectorDefinition("Jerusalem to Bethlehem", "JRS-BTH"),
            new SectorDefinition("Jerusalem to Dead Sea", "JRS-DS"),
            new SectorDefinition("Jerusalem to Jericho", "JRS-JRC"),
            new SectorDefinition("Jerusalem to Nazareth", "JRS-NZR"),
            new SectorDefinition("Nazareth to Sea of Galilee", "NZR-GAL"),
            new SectorDefinition("Tiberias to Airport", "TIB-TLV"),
            new SectorDefinition("Airport to Bethlehem", "TLV-BTH"),
            new SectorDefinition("Airport to Nazareth", "TLV-NZR"),
            new SectorDefinition("Jerusalem to Ein Karem", "JRS-EKR"),
            new SectorDefinition("Jerusalem to Hebron", "JRS-HEB"),
            new SectorDefinition("Bethlehem to Hebron", "BTH-HEB"),
            new SectorDefinition("Dead Sea to Masada", "DS-MSD"),
            new SectorDefinition("Jericho to Dead Sea", "JRC-DS"),
            new SectorDefinition("Nazareth to Cana", "NZR-CANA"),
            new SectorDefinition("Cana to Sea of Galilee", "CANA-GAL"),
            new SectorDefinition("Galilee to Capernaum", "GAL-CAP"),
            new SectorDefinition("Tiberias to Nazareth", "TIB-NZR"),
            new SectorDefinition("Nazareth to Acre", "NZR-ACR"),
            new SectorDefinition("Acre to Haifa", "ACR-HFA"),
            new SectorDefinition("Haifa to Airport", "HFA-TLV"),
            new SectorDefinition("Jerusalem to Tiberias", "JRS-TIB"),
            new SectorDefinition("Bethlehem to Jerusalem", "BTH-JRS")
        };

        var sectors = (await db.Set<Sector>().ToListAsync())
            .GroupBy(sector => sector.Code, StringComparer.OrdinalIgnoreCase)
            .ToDictionary(group => group.Key, group => group.First(), StringComparer.OrdinalIgnoreCase);

        foreach (var definition in definitions)
        {
            if (sectors.ContainsKey(definition.Code))
            {
                continue;
            }

            var sector = new Sector
            {
                Name = definition.Name,
                Code = definition.Code,
                CreatedBy = createdBy,
                CreatedDate = SeedCreatedDate
            };
            db.Add(sector);
            sectors.Add(definition.Code, sector);
        }

        await db.SaveChangesAsync();
        return sectors;
    }

    private static async Task<Dictionary<string, Transport>> SeedTransportsAsync(
        ApplicationDbContext db,
        string createdBy)
    {
        var definitions = new[]
        {
            new TransportDefinition("T1", 1, 2),
            new TransportDefinition("T2", 3, 5),
            new TransportDefinition("T3", 6, 9),
            new TransportDefinition("T4", 10, 19),
            new TransportDefinition("T5", 20, 24),
            new TransportDefinition("T6", 25, 100)
        };

        var transports = (await db.Set<Transport>().ToListAsync())
            .GroupBy(transport => transport.Name, StringComparer.OrdinalIgnoreCase)
            .ToDictionary(group => group.Key, group => group.First(), StringComparer.OrdinalIgnoreCase);

        foreach (var definition in definitions)
        {
            if (transports.ContainsKey(definition.Name))
            {
                continue;
            }

            var transport = new Transport
            {
                Name = definition.Name,
                MinPAX = definition.MinPax,
                MaxPAX = definition.MaxPax,
                CreatedBy = createdBy,
                CreatedDate = SeedCreatedDate
            };
            db.Add(transport);
            transports.Add(definition.Name, transport);
        }

        await db.SaveChangesAsync();
        return transports;
    }

    private static async Task SeedSectorTransportRatesAsync(
        ApplicationDbContext db,
        IReadOnlyDictionary<string, Sector> sectors,
        IReadOnlyDictionary<string, Transport> transports,
        string createdBy)
    {
        var rates = new Dictionary<string, decimal[]>
        {
            ["TLV-JRS"] = [72m, 95m, 125m, 175m, 225m, 285m],
            ["JRS-CITY"] = [95m, 125m, 165m, 230m, 295m, 370m],
            ["JRS-BTH"] = [58m, 78m, 105m, 148m, 190m, 240m],
            ["JRS-DS"] = [125m, 165m, 215m, 300m, 385m, 480m],
            ["JRS-JRC"] = [105m, 140m, 185m, 255m, 330m, 410m],
            ["JRS-NZR"] = [175m, 225m, 295m, 410m, 525m, 650m],
            ["NZR-GAL"] = [88m, 115m, 150m, 210m, 270m, 335m],
            ["TIB-TLV"] = [185m, 240m, 315m, 440m, 560m, 695m],
            ["TLV-BTH"] = [82m, 108m, 142m, 198m, 252m, 315m],
            ["TLV-NZR"] = [168m, 218m, 285m, 398m, 508m, 630m],
            ["JRS-EKR"] = [52m, 70m, 92m, 128m, 165m, 205m],
            ["JRS-HEB"] = [92m, 122m, 160m, 222m, 285m, 355m],
            ["BTH-HEB"] = [65m, 86m, 112m, 158m, 202m, 250m],
            ["DS-MSD"] = [68m, 90m, 118m, 165m, 210m, 262m],
            ["JRC-DS"] = [78m, 102m, 134m, 188m, 240m, 298m],
            ["NZR-CANA"] = [48m, 64m, 84m, 118m, 150m, 188m],
            ["CANA-GAL"] = [72m, 95m, 124m, 174m, 222m, 278m],
            ["GAL-CAP"] = [55m, 73m, 96m, 134m, 172m, 215m],
            ["TIB-NZR"] = [82m, 108m, 142m, 198m, 252m, 315m],
            ["NZR-ACR"] = [92m, 120m, 158m, 220m, 282m, 350m],
            ["ACR-HFA"] = [58m, 76m, 100m, 140m, 180m, 224m],
            ["HFA-TLV"] = [155m, 202m, 265m, 370m, 472m, 588m],
            ["JRS-TIB"] = [188m, 245m, 322m, 448m, 572m, 712m],
            ["BTH-JRS"] = [58m, 78m, 105m, 148m, 190m, 240m]
        };
        var transportOrder = new[] { "T1", "T2", "T3", "T4", "T5", "T6" };
        var existingPairs = (await db.Set<SectorTransport>().ToListAsync())
            .Select(rate => (rate.SectorId, rate.TransportId))
            .ToHashSet();

        foreach (var (sectorCode, costs) in rates)
        {
            for (var index = 0; index < transportOrder.Length; index++)
            {
                var sector = sectors[sectorCode];
                var transport = transports[transportOrder[index]];
                if (existingPairs.Contains((sector.Id, transport.Id)))
                {
                    continue;
                }

                db.Add(new SectorTransport
                {
                    SectorId = sector.Id,
                    TransportId = transport.Id,
                    Cost = costs[index],
                    CreatedBy = createdBy,
                    CreatedDate = SeedCreatedDate
                });
                existingPairs.Add((sector.Id, transport.Id));
            }
        }

        await db.SaveChangesAsync();
    }

    private static async Task<Dictionary<string, Customer>> SeedCustomersAsync(
        ApplicationDbContext db,
        FiscalYear fiscalYear,
        string createdBy)
    {
        var definitions = new[]
        {
            new CustomerDefinition("8384/0001", "Holy Land Heritage Journey", "United Kingdom", new DateTime(2026, 9, 12), new DateTime(2026, 9, 19), "Cedar Travel Group", "Amelia Grant", "Youssef Ibrahim"),
            new CustomerDefinition("8384/0002", "Biblical Lands Pilgrimage", "United States", new DateTime(2026, 10, 4), new DateTime(2026, 10, 12), "St Anne Pilgrimages", "Michael Torres", "Sarah Cohen"),
            new CustomerDefinition("8384/0003", "Jerusalem and Galilee Discovery", "Spain", new DateTime(2026, 11, 8), new DateTime(2026, 11, 15), "Camino Mundo", "Lucia Fernandez", "Omar Khalil"),
            new CustomerDefinition("8384/0004", "Christmas in Bethlehem", "Italy", new DateTime(2026, 12, 20), new DateTime(2026, 12, 27), "Aurora Viaggi", "Marco Bianchi", "Miriam Haddad"),
            new CustomerDefinition("8384/0005", "Dead Sea Wellness Retreat", "Germany", new DateTime(2027, 1, 18), new DateTime(2027, 1, 23), "Nordlicht Reisen", "Hannah Weber", "Rachel Levy"),
            new CustomerDefinition("8384/0006", "Easter Pilgrimage Tour", "Ireland", new DateTime(2027, 3, 24), new DateTime(2027, 4, 2), "Emerald Faith Travel", "Sean Murphy", "Youssef Ibrahim"),
            new CustomerDefinition("8384/0007", "Family Heritage Explorer", "Canada", new DateTime(2027, 4, 11), new DateTime(2027, 4, 18), "Maple Leaf Journeys", "Sophie Tremblay", "Sarah Cohen"),
            new CustomerDefinition("8384/0008", "Galilee Cultural Encounter", "France", new DateTime(2027, 5, 9), new DateTime(2027, 5, 16), "Voyages Lumiere", "Claire Dubois", "Omar Khalil"),
            new CustomerDefinition("8384/0009", "Biblical Landscapes Explorer", "Australia", new DateTime(2026, 9, 21), new DateTime(2026, 9, 29), "Southern Cross Pilgrimages", "Olivia Bennett", "Daniel Ben-Ami"),
            new CustomerDefinition("8384/0010", "Jerusalem Faith and History", "Brazil", new DateTime(2026, 10, 15), new DateTime(2026, 10, 23), "Caminhos Sagrados", "Rafael Costa", "Layla Nassar"),
            new CustomerDefinition("8384/0011", "Galilee and Coastal Heritage", "Netherlands", new DateTime(2026, 11, 2), new DateTime(2026, 11, 10), "Oranje Reizen", "Sanne de Vries", "Elias Khoury"),
            new CustomerDefinition("8384/0012", "Advent Pilgrimage Journey", "Poland", new DateTime(2026, 12, 3), new DateTime(2026, 12, 11), "Pielgrzym Travel", "Anna Kowalska", "Noa Shalev"),
            new CustomerDefinition("8384/0013", "Holy Sites Study Tour", "South Korea", new DateTime(2027, 1, 7), new DateTime(2027, 1, 15), "Hanul Christian Tours", "Min-jun Park", "Samir Awad"),
            new CustomerDefinition("8384/0014", "Pilgrims of Peace Journey", "Philippines", new DateTime(2027, 1, 28), new DateTime(2027, 2, 6), "Mabuhay Pilgrimages", "Maria Santos", "Rebecca Gold"),
            new CustomerDefinition("8384/0015", "Jerusalem Leadership Retreat", "Nigeria", new DateTime(2027, 2, 14), new DateTime(2027, 2, 21), "Unity Faith Travel", "Chinedu Okafor", "George Mansour"),
            new CustomerDefinition("8384/0016", "Lenten Holy Land Experience", "South Africa", new DateTime(2027, 3, 5), new DateTime(2027, 3, 14), "Ubuntu Sacred Tours", "Thandi Mokoena", "Hana Saleh"),
            new CustomerDefinition("8384/0017", "Family Pilgrimage Adventure", "Mexico", new DateTime(2027, 3, 18), new DateTime(2027, 3, 26), "Senderos de Fe", "Sofia Ramirez", "David Rosen"),
            new CustomerDefinition("8384/0018", "Mediterranean Bible Journey", "Portugal", new DateTime(2027, 4, 4), new DateTime(2027, 4, 12), "Luz Peregrina", "Ines Martins", "Leila Yacoub"),
            new CustomerDefinition("8384/0019", "Jerusalem Music and Culture", "Austria", new DateTime(2027, 4, 17), new DateTime(2027, 4, 24), "Donau Kulturreisen", "Lukas Gruber", "Daniel Ben-Ami"),
            new CustomerDefinition("8384/0020", "Interfaith Heritage Tour", "Switzerland", new DateTime(2027, 4, 28), new DateTime(2027, 5, 6), "Alpine Dialogue Travel", "Nina Keller", "Layla Nassar"),
            new CustomerDefinition("8384/0021", "Galilee Walking Retreat", "Norway", new DateTime(2027, 5, 12), new DateTime(2027, 5, 20), "Nordlys Retreats", "Erik Hansen", "Elias Khoury"),
            new CustomerDefinition("8384/0022", "Ancient Cities Discovery", "Denmark", new DateTime(2027, 5, 23), new DateTime(2027, 5, 31), "Nordic Heritage Tours", "Freja Nielsen", "Noa Shalev"),
            new CustomerDefinition("8384/0023", "Holy Land Community Visit", "India", new DateTime(2027, 6, 3), new DateTime(2027, 6, 12), "Sangam Faith Journeys", "Ananya Rao", "Samir Awad"),
            new CustomerDefinition("8384/0024", "Summer Family Discovery", "Singapore", new DateTime(2027, 6, 18), new DateTime(2027, 6, 26), "Lion City Pilgrimages", "Mei Lin Tan", "Rebecca Gold")
        };

        var customers = (await db.Set<Customer>().ToListAsync())
            .GroupBy(customer => customer.FileCodeNo, StringComparer.OrdinalIgnoreCase)
            .ToDictionary(group => group.Key, group => group.First(), StringComparer.OrdinalIgnoreCase);

        foreach (var definition in definitions)
        {
            if (customers.ContainsKey(definition.FileCodeNo))
            {
                continue;
            }

            var customer = new Customer
            {
                FiscalYearId = fiscalYear.Id,
                FileCodeNo = definition.FileCodeNo,
                TourName = definition.TourName,
                Country = definition.Country,
                ArrivalDate = definition.ArrivalDate,
                DepartureDate = definition.DepartureDate,
                Agent = definition.Agent,
                AgentStaff = definition.AgentStaff,
                GuideName = definition.GuideName,
                CreatedBy = createdBy,
                CreatedDate = definition.ArrivalDate.AddMonths(-4)
            };
            db.Add(customer);
            customers.Add(definition.FileCodeNo, customer);
        }

        await db.SaveChangesAsync();
        return customers;
    }

    private static async Task SeedInvoicesAsync(
        ApplicationDbContext db,
        FiscalYear fiscalYear,
        IReadOnlyDictionary<string, Customer> customers,
        string createdBy)
    {
        var definitions = new[]
        {
            new InvoiceDefinition("8384/0001", "8384/0001", false, "Cedar Travel Group", "14 King Street, London, UK", "Amelia Grant", "GBP", 5, "Youssef Ibrahim", "T2", 6250m, 250m, new DateTime(2026, 8, 20), [new("Hotel accommodation - 7 nights", 3150m), new("Private transport and transfers", 1650m), new("Guide and entrance services", 1450m)]),
            new InvoiceDefinition("8384/0002", "8384/0002", false, "St Anne Pilgrimages", "250 Beacon Street, Boston, USA", "Michael Torres", "USD", 18, "Sarah Cohen", "T4", 21800m, 800m, new DateTime(2026, 9, 5), [new("Hotel accommodation - 8 nights", 11200m), new("Coach transport and transfers", 5900m), new("Guide, meals and entrance services", 4700m)]),
            new InvoiceDefinition("8384/0003", "8384/0003", false, "Camino Mundo", "48 Calle Mayor, Madrid, Spain", "Lucia Fernandez", "EUR", 9, "Omar Khalil", "T3", 10450m, 450m, new DateTime(2026, 10, 8), [new("Hotel accommodation - 7 nights", 5250m), new("Minibus transport and transfers", 2850m), new("Guide and entrance services", 2350m)]),
            new InvoiceDefinition("8384/0004", "8384/0004", false, "Aurora Viaggi", "31 Via Roma, Milan, Italy", "Marco Bianchi", "EUR", 22, "Miriam Haddad", "T5", 24750m, 750m, new DateTime(2026, 11, 12), [new("Hotel accommodation - 7 nights", 12600m), new("Coach transport and transfers", 6850m), new("Guide, meals and entrance services", 5300m)]),
            new InvoiceDefinition("8384/0005", "8384/0005", false, "Nordlicht Reisen", "9 Lindenstrasse, Hamburg, Germany", "Hannah Weber", "EUR", 8, "Rachel Levy", "T3", 9800m, 300m, new DateTime(2026, 12, 10), [new("Dead Sea resort accommodation", 5600m), new("Private transport and transfers", 2400m), new("Wellness and guide services", 1800m)]),
            new InvoiceDefinition("8384/0006", "8384/0006", true, "Emerald Faith Travel", "16 Merrion Square, Dublin, Ireland", "Sean Murphy", "EUR", 32, "Youssef Ibrahim", "T6", 38900m, 1400m, new DateTime(2027, 2, 15), [new("Hotel accommodation - 9 nights", 19800m), new("Full-size coach and transfers", 10400m), new("Guide, meals and entrance services", 8700m)])
        };
        definitions = definitions.Concat(BuildAdditionalInvoices(customers)).ToArray();

        var invoices = (await db.Set<Invoice>().ToListAsync())
            .GroupBy(invoice => invoice.InvoiceNo, StringComparer.OrdinalIgnoreCase)
            .ToDictionary(group => group.Key, group => group.First(), StringComparer.OrdinalIgnoreCase);

        foreach (var definition in definitions)
        {
            if (!invoices.TryGetValue(definition.InvoiceNo, out var invoice))
            {
                invoice = new Invoice
                {
                    InvoiceNo = definition.InvoiceNo,
                    IsTicket = definition.IsTicket,
                    FileCodeNo = customers[definition.FileCodeNo].FileCodeNo,
                    FiscalYearId = fiscalYear.Id,
                    ReferenceNo = $"REF-{definition.InvoiceNo.Replace("/", "-")}",
                    Dr = definition.Dr,
                    Address = definition.Address,
                    ClientName = definition.ClientName,
                    Currency = definition.Currency,
                    PAX = definition.Pax,
                    Guide = definition.Guide,
                    Vehicle = definition.Vehicle,
                    TotalDue = definition.TotalDue,
                    Discount = definition.Discount,
                    NetAmount = definition.TotalDue - definition.Discount,
                    CreatedBy = createdBy,
                    CreatedDate = definition.CreatedDate
                };
                db.Add(invoice);
                invoices.Add(definition.InvoiceNo, invoice);
                await db.SaveChangesAsync();
            }

            var existingParticulars = (await db.Set<InvoiceDetail>()
                    .Where(detail => detail.InvoiceId == invoice.Id)
                    .Select(detail => detail.Particulars)
                    .ToListAsync())
                .ToHashSet(StringComparer.OrdinalIgnoreCase);

            foreach (var detail in definition.Details)
            {
                if (existingParticulars.Contains(detail.Particulars))
                {
                    continue;
                }

                db.Add(new InvoiceDetail
                {
                    InvoiceId = invoice.Id,
                    Particulars = detail.Particulars,
                    Amount = detail.Amount,
                    CreatedBy = createdBy,
                    CreatedDate = definition.CreatedDate
                });
            }

            await db.SaveChangesAsync();
        }
    }

    private static IEnumerable<InvoiceDefinition> BuildAdditionalInvoices(
        IReadOnlyDictionary<string, Customer> customers)
    {
        var definitions = new[]
        {
            new AdditionalInvoiceDefinition("8384/0007", "88 Rue Saint-Paul, Montreal, Canada", "CAD", 5, "T2", 82m, 1750m, 31m, 220m),
            new AdditionalInvoiceDefinition("8384/0008", "24 Rue de Rivoli, Paris, France", "EUR", 8, "T3", 78m, 2450m, 29m, 300m),
            new AdditionalInvoiceDefinition("8384/0009", "60 George Street, Sydney, Australia", "AUD", 14, "T4", 80m, 4200m, 30m, 540m),
            new AdditionalInvoiceDefinition("8384/0010", "115 Avenida Paulista, Sao Paulo, Brazil", "USD", 18, "T4", 76m, 4800m, 28m, 650m),
            new AdditionalInvoiceDefinition("8384/0011", "42 Prinsengracht, Amsterdam, Netherlands", "EUR", 9, "T3", 84m, 2750m, 32m, 360m),
            new AdditionalInvoiceDefinition("8384/0012", "17 Krakowskie Przedmiescie, Warsaw, Poland", "EUR", 24, "T5", 74m, 6200m, 27m, 820m),
            new AdditionalInvoiceDefinition("8384/0013", "73 Jong-ro, Seoul, South Korea", "USD", 20, "T5", 79m, 5900m, 30m, 760m),
            new AdditionalInvoiceDefinition("8384/0014", "28 Ayala Avenue, Makati, Philippines", "USD", 34, "T6", 72m, 8600m, 26m, 1100m),
            new AdditionalInvoiceDefinition("8384/0015", "11 Marina Road, Lagos, Nigeria", "USD", 16, "T4", 77m, 4550m, 29m, 590m),
            new AdditionalInvoiceDefinition("8384/0016", "90 Long Street, Cape Town, South Africa", "USD", 28, "T6", 75m, 7800m, 28m, 980m),
            new AdditionalInvoiceDefinition("8384/0017", "36 Paseo de la Reforma, Mexico City, Mexico", "USD", 12, "T4", 81m, 3900m, 30m, 480m),
            new AdditionalInvoiceDefinition("8384/0018", "19 Avenida da Liberdade, Lisbon, Portugal", "EUR", 10, "T4", 83m, 3400m, 31m, 420m)
        };

        foreach (var definition in definitions)
        {
            var customer = customers[definition.FileCodeNo];
            var nights = ((customer.DepartureDate ?? customer.ArrivalDate!.Value) - customer.ArrivalDate!.Value).Days;
            var accommodation = definition.Pax * nights * definition.NightlyRate;
            var services = definition.Pax * nights * definition.DailyServiceRate;
            var totalDue = accommodation + definition.TransportAmount + services;

            yield return new InvoiceDefinition(
                definition.FileCodeNo,
                definition.FileCodeNo,
                false,
                customer.Agent,
                definition.Address,
                customer.AgentStaff,
                definition.Currency,
                definition.Pax,
                customer.GuideName,
                definition.Vehicle,
                totalDue,
                definition.Discount,
                customer.ArrivalDate.Value.AddDays(-45),
                [
                    new InvoiceDetailDefinition($"Hotel accommodation - {nights} nights", accommodation),
                    new InvoiceDetailDefinition("Tour transport and airport transfers", definition.TransportAmount),
                    new InvoiceDetailDefinition("Guide, meals and entrance services", services)
                ]);
        }
    }

    private static async Task SeedServiceVouchersAsync(
        ApplicationDbContext db,
        FiscalYear fiscalYear,
        IReadOnlyDictionary<string, Customer> customers,
        IReadOnlyDictionary<string, Hotel> hotels,
        string createdBy)
    {
        var definitions = new[]
        {
            new VoucherDefinition("8384/0001", "8384/0001", "ORJ", "Amelia Grant", 5, new DateTime(2026, 9, 12, 14, 35, 0), "Ben Gurion Airport", "BA165", new DateTime(2026, 9, 19, 10, 20, 0), "Ben Gurion Airport", "BA164", "Seven nights MAP accommodation; private airport transfers"),
            new VoucherDefinition("8384/0002", "8384/0002", "MSH", "Michael Torres", 18, new DateTime(2026, 10, 4, 16, 10, 0), "Ben Gurion Airport", "DL234", new DateTime(2026, 10, 12, 11, 45, 0), "Ben Gurion Airport", "DL235", "Eight nights AP accommodation; coach transfers; porterage"),
            new VoucherDefinition("8384/0003", "8384/0003", "GCH", "Lucia Fernandez", 9, new DateTime(2026, 11, 8, 13, 25, 0), "Ben Gurion Airport", "IB2390", new DateTime(2026, 11, 15, 17, 10, 0), "Ben Gurion Airport", "IB2391", "Seven nights MAP accommodation; minibus transfers"),
            new VoucherDefinition("8384/0004", "8384/0004", "ORJ", "Marco Bianchi", 22, new DateTime(2026, 12, 20, 12, 40, 0), "Ben Gurion Airport", "AZ806", new DateTime(2026, 12, 27, 18, 30, 0), "Ben Gurion Airport", "AZ807", "Christmas programme; seven nights AP accommodation; coach transfers"),
            new VoucherDefinition("8384/0005", "8384/0005", "NDS", "Hannah Weber", 8, new DateTime(2027, 1, 18, 15, 20, 0), "Ben Gurion Airport", "LH686", new DateTime(2027, 1, 23, 9, 50, 0), "Ben Gurion Airport", "LH687", "Five nights MAP accommodation; spa access; private transfers"),
            new VoucherDefinition("8384/0006", "8384/0006", "MSH", "Sean Murphy", 32, new DateTime(2027, 3, 24, 14, 5, 0), "Ben Gurion Airport", "EI406", new DateTime(2027, 4, 2, 12, 15, 0), "Ben Gurion Airport", "EI407", "Nine nights AP accommodation; full-size coach; porterage")
        };
        definitions = definitions.Concat(BuildAdditionalVouchers(customers)).ToArray();

        var exchangeOrderNumbers = (await db.Set<ServiceVoucher>()
                .Select(voucher => voucher.ExchangeOrderNo)
                .ToListAsync())
            .ToHashSet(StringComparer.OrdinalIgnoreCase);

        foreach (var definition in definitions)
        {
            if (exchangeOrderNumbers.Contains(definition.ExchangeOrderNo))
            {
                continue;
            }

            db.Add(new ServiceVoucher
            {
                ExchangeOrderNo = definition.ExchangeOrderNo,
                FileCodeNo = customers[definition.FileCodeNo].FileCodeNo,
                FiscalYearId = fiscalYear.Id,
                HotelId = hotels[definition.HotelCode].Id,
                ClientName = definition.ClientName,
                PAX = definition.Pax,
                ArrivalDate = definition.ArrivalDate,
                From = definition.From,
                ArrivalFlight = definition.ArrivalFlight,
                DepartureDate = definition.DepartureDate,
                To = definition.To,
                DepartureFlight = definition.DepartureFlight,
                Services = definition.Services,
                CreatedBy = createdBy,
                CreatedDate = definition.ArrivalDate.AddMonths(-2)
            });
        }

        await db.SaveChangesAsync();
    }

    private static IEnumerable<VoucherDefinition> BuildAdditionalVouchers(
        IReadOnlyDictionary<string, Customer> customers)
    {
        var definitions = new[]
        {
            new AdditionalVoucherDefinition("8384/0007", "MZB", 5, "AC080", "AC081", "MAP accommodation; private transfers; family rooms"),
            new AdditionalVoucherDefinition("8384/0008", "SGG", 8, "AF962", "AF963", "MAP accommodation; minibus transfers; Galilee excursions"),
            new AdditionalVoucherDefinition("8384/0009", "ORJ", 14, "QF5019", "QF5020", "AP accommodation; coach transfers; porterage"),
            new AdditionalVoucherDefinition("8384/0010", "MGH", 18, "LA812", "LA813", "AP accommodation; coach transfers; meeting room"),
            new AdditionalVoucherDefinition("8384/0011", "AHH", 9, "KL461", "KL462", "MAP accommodation; coastal transfers; luggage handling"),
            new AdditionalVoucherDefinition("8384/0012", "BHH", 24, "LO151", "LO152", "AP accommodation; coach transfers; Advent programme"),
            new AdditionalVoucherDefinition("8384/0013", "NOH", 20, "KE957", "KE958", "AP accommodation; coach transfers; Korean-speaking assistance"),
            new AdditionalVoucherDefinition("8384/0014", "MSH", 34, "PR208", "PR209", "AP accommodation; full-size coach; porterage"),
            new AdditionalVoucherDefinition("8384/0015", "EKP", 16, "ET404", "ET405", "MAP accommodation; coach transfers; conference room"),
            new AdditionalVoucherDefinition("8384/0016", "GCH", 28, "SA190", "SA191", "AP accommodation; full-size coach; Lenten programme"),
            new AdditionalVoucherDefinition("8384/0017", "JPG", 12, "AM786", "AM787", "MAP accommodation; coach transfers; family rooms"),
            new AdditionalVoucherDefinition("8384/0018", "CHR", 10, "TP1604", "TP1605", "MAP accommodation; minibus transfers; coastal excursion")
        };

        foreach (var definition in definitions)
        {
            var customer = customers[definition.FileCodeNo];
            yield return new VoucherDefinition(
                definition.FileCodeNo,
                definition.FileCodeNo,
                definition.HotelCode,
                customer.AgentStaff,
                definition.Pax,
                customer.ArrivalDate.Value.AddHours(14),
                "Ben Gurion Airport",
                definition.ArrivalFlight,
                customer.DepartureDate.Value.AddHours(10),
                "Ben Gurion Airport",
                definition.DepartureFlight,
                definition.Services);
        }
    }

    private static async Task SeedTourCostsAsync(
        ApplicationDbContext db,
        IReadOnlyDictionary<string, Guide> guides,
        IReadOnlyDictionary<string, Sector> sectors,
        IReadOnlyDictionary<string, Hotel> hotels,
        string createdBy)
    {
        var definitions = new[]
        {
            new TourCostDefinition("Cedar Travel Group - Heritage", 2, 5, "Youssef Ibrahim", "MAP", false, 1, 4, 0, 5, 5, "Five-day private heritage itinerary for a small group.",
            [
                new("Day 1", "TLV-JRS", null, "ORJ", "MSH", "JOI", 310m, 245m, 185m),
                new("Day 2", "JRS-CITY", null, "ORJ", "MSH", "JOI", 335m, 265m, 205m),
                new("Day 3", "JRS-BTH", null, "ORJ", "MSH", "JOI", 320m, 250m, 195m),
                new("Day 4", "JRS-DS", "JRS-JRC", "NDS", "GCH", "LVG", 365m, 295m, 225m),
                new("Day 5", "TIB-TLV", null, "NDS", "GCH", "LVG", 345m, 275m, 215m)
            ]),
            new TourCostDefinition("St Anne Pilgrimages - Biblical Lands", 10, 19, "Sarah Cohen", "AP", true, 0, 5, 2, 3, 4, "Five-day premium pilgrimage programme with escort service.",
            [
                new("Day 1", "TLV-JRS", null, "ORJ", "MSH", "JOI", 285m, 225m, 170m),
                new("Day 2", "JRS-CITY", null, "ORJ", "MSH", "JOI", 315m, 250m, 190m),
                new("Day 3", "JRS-BTH", "JRS-JRC", "ORJ", "MSH", "JOI", 325m, 260m, 200m),
                new("Day 4", "JRS-NZR", null, "NDS", "GCH", "LVG", 350m, 280m, 215m),
                new("Day 5", "NZR-GAL", "TIB-TLV", "NDS", "GCH", "LVG", 360m, 290m, 225m)
            ]),
            new TourCostDefinition("Aurora Viaggi - Christmas Programme", 20, 24, "Miriam Haddad", "AP", false, 1, 4, 1, 6, 5, "Festive group itinerary centred on Jerusalem and Bethlehem.",
            [
                new("Day 1", "TLV-JRS", null, "ORJ", "MSH", "JOI", 270m, 215m, 165m),
                new("Day 2", "JRS-CITY", null, "ORJ", "MSH", "JOI", 295m, 235m, 180m),
                new("Day 3", "JRS-BTH", null, "ORJ", "MSH", "JOI", 305m, 245m, 190m),
                new("Day 4", "JRS-DS", "JRS-JRC", "NDS", "GCH", "LVG", 335m, 270m, 205m),
                new("Day 5", "TIB-TLV", null, "NDS", "GCH", "LVG", 320m, 255m, 198m)
            ]),
            new TourCostDefinition("Emerald Faith Travel - Easter", 25, 40, "Youssef Ibrahim", "AP", false, 0, 5, 3, 4, 6, "Easter season coach programme for a large pilgrimage group.",
            [
                new("Day 1", "TLV-JRS", null, "ORJ", "MSH", "JOI", 255m, 205m, 155m),
                new("Day 2", "JRS-CITY", null, "ORJ", "MSH", "JOI", 280m, 225m, 170m),
                new("Day 3", "JRS-BTH", "JRS-JRC", "ORJ", "MSH", "JOI", 290m, 235m, 180m),
                new("Day 4", "JRS-NZR", null, "NDS", "GCH", "LVG", 315m, 255m, 195m),
                new("Day 5", "NZR-GAL", "TIB-TLV", "NDS", "GCH", "LVG", 325m, 265m, 205m)
            ])
        };

        definitions = definitions.Concat(BuildAdditionalTourCosts()).ToArray();

        var tourCosts = (await db.Set<Tourcost>().ToListAsync())
            .GroupBy(tourCost => tourCost.ClientName, StringComparer.OrdinalIgnoreCase)
            .ToDictionary(group => group.Key, group => group.First(), StringComparer.OrdinalIgnoreCase);

        foreach (var definition in definitions)
        {
            if (!tourCosts.TryGetValue(definition.ClientName, out var tourCost))
            {
                tourCost = new Tourcost
                {
                    ClientName = definition.ClientName,
                    MinPAX = definition.MinPax,
                    MaxPAX = definition.MaxPax,
                    Days = definition.Days.Length,
                    Category1 = "Premium",
                    Category2 = "Superior",
                    Category3 = "Standard",
                    GuideId = guides[definition.GuideName].Id,
                    MealType = definition.MealType,
                    IsLuxury = definition.IsLuxury,
                    GuideDaysHalfDay = definition.GuideHalfDays,
                    GuideDaysFullDay = definition.GuideFullDays,
                    GuideDaysEscort = definition.GuideEscortDays,
                    DiscountTransportation = definition.TransportDiscount,
                    DiscountAccomodation = definition.AccommodationDiscount,
                    Comment = definition.Comment,
                    CreatedBy = createdBy,
                    CreatedDate = SeedCreatedDate
                };
                db.Add(tourCost);
                tourCosts.Add(definition.ClientName, tourCost);
                await db.SaveChangesAsync();
            }

            var existingDays = (await db.Set<TourcostDetail>()
                    .Where(detail => detail.TourcostId == tourCost.Id)
                    .Select(detail => detail.Day)
                    .ToListAsync())
                .ToHashSet(StringComparer.OrdinalIgnoreCase);

            foreach (var day in definition.Days)
            {
                if (existingDays.Contains(day.Day))
                {
                    continue;
                }

                db.Add(new TourcostDetail
                {
                    Day = day.Day,
                    TourcostId = tourCost.Id,
                    Sector1Id = sectors[day.Sector1Code].Id,
                    Sector2Id = day.Sector2Code == null ? null : sectors[day.Sector2Code].Id,
                    HotelAId = hotels[day.HotelACode].Id,
                    HotelBId = hotels[day.HotelBCode].Id,
                    HotelCId = hotels[day.HotelCCode].Id,
                    Category1Cost = day.Category1Cost,
                    Category2Cost = day.Category2Cost,
                    Category3Cost = day.Category3Cost,
                    CreatedBy = createdBy,
                    CreatedDate = SeedCreatedDate
                });
            }

            await db.SaveChangesAsync();
        }
    }

    private static IEnumerable<TourCostDefinition> BuildAdditionalTourCosts()
    {
        return
        [
            new("Maple Leaf Journeys - Family Heritage", 3, 5, "Daniel Ben-Ami", "MAP", false, 1, 4, 0, 4, 5, "A relaxed family itinerary combining Jerusalem, Bethlehem and the Dead Sea.",
            [
                new("Day 1", "TLV-JRS", null, "MGH", "BHH", "EKP", 318m, 252m, 191m),
                new("Day 2", "JRS-CITY", "JRS-EKR", "MGH", "BHH", "EKP", 342m, 272m, 208m),
                new("Day 3", "JRS-BTH", "BTH-HEB", "MZB", "BHH", "EKP", 328m, 261m, 199m),
                new("Day 4", "JRS-DS", "DS-MSD", "NDS", "GCH", "JPG", 371m, 299m, 228m),
                new("Day 5", "JRC-DS", "TIB-TLV", "NDS", "GCH", "JPG", 352m, 283m, 217m)
            ]),
            new("Voyages Lumiere - Galilee Encounter", 6, 9, "Omar Khalil", "MAP", false, 1, 4, 0, 5, 4, "A cultural journey from Nazareth through Galilee and the Mediterranean coast.",
            [
                new("Day 1", "TLV-NZR", null, "SGG", "NOH", "CVI", 304m, 241m, 184m),
                new("Day 2", "NZR-CANA", "CANA-GAL", "SGG", "NOH", "CVI", 326m, 259m, 198m),
                new("Day 3", "NZR-GAL", "GAL-CAP", "SGG", "MTL", "LVG", 337m, 269m, 205m),
                new("Day 4", "TIB-NZR", "NZR-ACR", "CHR", "AHH", "HBG", 349m, 279m, 213m),
                new("Day 5", "ACR-HFA", "HFA-TLV", "CHR", "AHH", "HBG", 321m, 257m, 196m)
            ]),
            new("Southern Cross - Biblical Landscapes", 10, 19, "Daniel Ben-Ami", "AP", true, 0, 5, 2, 3, 4, "An escorted study programme covering the principal biblical landscapes.",
            [
                new("Day 1", "TLV-JRS", null, "ORJ", "MSH", "JOI", 292m, 231m, 176m),
                new("Day 2", "JRS-CITY", "JRS-EKR", "ORJ", "MSH", "JOI", 319m, 254m, 193m),
                new("Day 3", "JRS-BTH", "BTH-JRS", "MZB", "BHH", "EKP", 312m, 248m, 189m),
                new("Day 4", "JRS-TIB", "NZR-GAL", "SGG", "NOH", "LVG", 356m, 284m, 216m),
                new("Day 5", "GAL-CAP", "TIB-TLV", "SGG", "MTL", "LVG", 344m, 275m, 209m)
            ]),
            new("Caminhos Sagrados - Faith and History", 20, 24, "Layla Nassar", "AP", false, 1, 4, 1, 5, 5, "A Portuguese-speaking pilgrimage balancing worship, history and local culture.",
            [
                new("Day 1", "TLV-BTH", null, "MGH", "BHH", "JPG", 274m, 218m, 166m),
                new("Day 2", "BTH-HEB", "BTH-JRS", "MGH", "BHH", "JPG", 301m, 239m, 182m),
                new("Day 3", "JRS-CITY", "JRS-EKR", "MZB", "MSH", "EKP", 309m, 246m, 187m),
                new("Day 4", "JRS-JRC", "JRC-DS", "NDS", "GCH", "JOI", 338m, 270m, 205m),
                new("Day 5", "DS-MSD", "TIB-TLV", "NDS", "GCH", "JOI", 329m, 263m, 200m)
            ]),
            new("Pielgrzym Travel - Advent Journey", 25, 40, "Noa Shalev", "AP", false, 0, 5, 2, 6, 6, "A large-group Advent pilgrimage with generous time in Jerusalem and Bethlehem.",
            [
                new("Day 1", "TLV-JRS", null, "ORJ", "BHH", "EKP", 261m, 208m, 158m),
                new("Day 2", "JRS-CITY", "JRS-EKR", "ORJ", "BHH", "EKP", 286m, 228m, 173m),
                new("Day 3", "JRS-BTH", "BTH-HEB", "MZB", "MSH", "JPG", 297m, 237m, 180m),
                new("Day 4", "BTH-JRS", "JRS-DS", "NDS", "GCH", "JPG", 322m, 258m, 196m),
                new("Day 5", "DS-MSD", "HFA-TLV", "NDS", "GCH", "JPG", 314m, 251m, 191m)
            ]),
            new("Hanul Christian Tours - Study Tour", 10, 19, "Samir Awad", "AP", true, 0, 5, 3, 4, 5, "An academic biblical study tour with a dedicated escort and expert guiding.",
            [
                new("Day 1", "TLV-NZR", null, "SGG", "NOH", "CVI", 298m, 237m, 180m),
                new("Day 2", "NZR-CANA", "CANA-GAL", "SGG", "NOH", "CVI", 323m, 257m, 195m),
                new("Day 3", "GAL-CAP", "TIB-NZR", "SGG", "MTL", "LVG", 341m, 272m, 207m),
                new("Day 4", "NZR-ACR", "ACR-HFA", "CHR", "AHH", "HBG", 353m, 282m, 214m),
                new("Day 5", "HFA-TLV", "TLV-JRS", "CHR", "AHH", "HBG", 333m, 266m, 202m)
            ]),
            new("Mabuhay Pilgrimages - Peace Journey", 25, 40, "Rebecca Gold", "AP", false, 1, 4, 2, 5, 5, "A community pilgrimage focused on reconciliation, sacred places and shared meals.",
            [
                new("Day 1", "TLV-BTH", null, "MGH", "BHH", "EKP", 264m, 210m, 160m),
                new("Day 2", "JRS-BTH", "BTH-JRS", "MGH", "BHH", "EKP", 289m, 230m, 175m),
                new("Day 3", "JRS-CITY", "JRS-EKR", "MZB", "MSH", "JOI", 296m, 236m, 179m),
                new("Day 4", "JRS-JRC", "JRC-DS", "NDS", "GCH", "JPG", 324m, 259m, 197m),
                new("Day 5", "DS-MSD", "TIB-TLV", "NDS", "GCH", "JPG", 317m, 253m, 193m)
            ]),
            new("Ubuntu Sacred Tours - Lenten Experience", 20, 24, "Hana Saleh", "MAP", false, 1, 4, 1, 4, 5, "A reflective Lenten programme connecting desert spirituality with the holy cities.",
            [
                new("Day 1", "TLV-JRS", null, "ORJ", "MSH", "EKP", 278m, 221m, 168m),
                new("Day 2", "JRS-CITY", "JRS-EKR", "ORJ", "MSH", "EKP", 303m, 241m, 183m),
                new("Day 3", "JRS-BTH", "JRS-HEB", "MZB", "BHH", "JOI", 311m, 248m, 188m),
                new("Day 4", "JRS-DS", "DS-MSD", "NDS", "GCH", "JPG", 339m, 271m, 206m),
                new("Day 5", "JRC-DS", "HFA-TLV", "NDS", "GCH", "JPG", 326m, 261m, 198m)
            ])
        ];
    }

    private static void ThrowIfFailed(IdentityResult result, string operation)
    {
        if (result.Succeeded)
        {
            return;
        }

        var errors = string.Join("; ", result.Errors.Select(error => error.Description));
        throw new InvalidOperationException($"Unable to {operation}: {errors}");
    }

    private sealed record HotelDefinition(
        string Name,
        string PhoneNo,
        string Address,
        string Code,
        char Category,
        decimal SingleBed,
        decimal DoubleBed,
        decimal ExtraBed,
        decimal Ap,
        decimal Map);

    private sealed record GuideDefinition(string Name, double FullDayRate, double HalfDayRate, double OvernightRate);
    private sealed record SectorDefinition(string Name, string Code);
    private sealed record TransportDefinition(string Name, int MinPax, int MaxPax);
    private sealed record CustomerDefinition(
        string FileCodeNo,
        string TourName,
        string Country,
        DateTime ArrivalDate,
        DateTime DepartureDate,
        string Agent,
        string AgentStaff,
        string GuideName);

    private sealed record InvoiceDetailDefinition(string Particulars, decimal Amount);

    private sealed record InvoiceDefinition(
        string InvoiceNo,
        string FileCodeNo,
        bool IsTicket,
        string Dr,
        string Address,
        string ClientName,
        string Currency,
        int Pax,
        string Guide,
        string Vehicle,
        decimal TotalDue,
        decimal Discount,
        DateTime CreatedDate,
        InvoiceDetailDefinition[] Details);

    private sealed record AdditionalInvoiceDefinition(
        string FileCodeNo,
        string Address,
        string Currency,
        int Pax,
        string Vehicle,
        decimal NightlyRate,
        decimal TransportAmount,
        decimal DailyServiceRate,
        decimal Discount);

    private sealed record VoucherDefinition(
        string ExchangeOrderNo,
        string FileCodeNo,
        string HotelCode,
        string ClientName,
        int Pax,
        DateTime ArrivalDate,
        string From,
        string ArrivalFlight,
        DateTime DepartureDate,
        string To,
        string DepartureFlight,
        string Services);

    private sealed record AdditionalVoucherDefinition(
        string FileCodeNo,
        string HotelCode,
        int Pax,
        string ArrivalFlight,
        string DepartureFlight,
        string Services);

    private sealed record TourCostDayDefinition(
        string Day,
        string Sector1Code,
        string Sector2Code,
        string HotelACode,
        string HotelBCode,
        string HotelCCode,
        decimal Category1Cost,
        decimal Category2Cost,
        decimal Category3Cost);

    private sealed record TourCostDefinition(
        string ClientName,
        int MinPax,
        int MaxPax,
        string GuideName,
        string MealType,
        bool IsLuxury,
        int GuideHalfDays,
        int GuideFullDays,
        int GuideEscortDays,
        int TransportDiscount,
        int AccommodationDiscount,
        string Comment,
        TourCostDayDefinition[] Days);
}
