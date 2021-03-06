﻿using System;
using System.Collections.Generic;
using System.Text;

namespace PeaceInternational.Core.Entity
{
    public class Guide : BaseEntity
    {
        public string Name { get; set; }
        public double FullDayRate { get; set; }
        public double HalfDayRate { get; set; }
        public double OverNight { get; set; }

        public ICollection<Tourcost> Tourcost { get; set; }
    }
}
