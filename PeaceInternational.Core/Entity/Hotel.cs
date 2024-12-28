﻿using System;
using System.Collections.Generic;
using System.Text;
using System.Text.Json.Serialization;

namespace PeaceInternational.Core.Entity
{
    public class Hotel : BaseEntity, IBaseEntity
    {
        public Hotel()
        {
            this.ServiceVoucher = new HashSet<ServiceVoucher>();
        }

        public string Name { get; set; }
        public string PhoneNo { get; set; }
        public string Address { get; set; }
        public string Code { get; set; }
        public char Category { get; set; }

        public HotelRoomRate HotelRoomRate { get; set; }

        public ICollection<ServiceVoucher> ServiceVoucher { get; set; }

        [JsonIgnore]
        public ICollection<TourcostDetail> TourcostDetailA { get; set; }
        [JsonIgnore]
        public ICollection<TourcostDetail> TourcostDetailB { get; set; }
        [JsonIgnore]
        public ICollection<TourcostDetail> TourcostDetailC { get; set; }
    }
}
