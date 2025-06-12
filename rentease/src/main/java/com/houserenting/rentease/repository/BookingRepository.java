package com.houserenting.rentease.repository;

import com.houserenting.rentease.model.Booking;
import com.houserenting.rentease.model.BookingStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {
    List<Booking> findByTenantId(Long tenantId);

    List<Booking> findByPropertyId(Long propertyId);

    List<Booking> findByStatus(BookingStatus status);

    List<Booking> findByPropertyIdAndStatus(Long propertyId, BookingStatus status);

    boolean existsByPropertyIdAndTenantIdAndStatus(Long propertyId, Long tenantId, BookingStatus status);
}
