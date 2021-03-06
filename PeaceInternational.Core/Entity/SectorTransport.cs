﻿using System;
using System.Collections.Generic;
using System.Text;

namespace PeaceInternational.Core.Entity
{
    public class SectorTransport : BaseEntity
    {
        public int SectorId { get; set; }
        public int TransportId { get; set; }
        public decimal Cost { get; set; }      

        public Sector Sector { get; set; }
        public Transport Transport { get; set; }
    }
}
