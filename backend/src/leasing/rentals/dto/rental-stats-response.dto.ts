export class RentalStatsResponseDto {
  /** Rentals currently in the `ACTIVE` lifecycle state. */
  activeCount: number;

  /**
   * Rentals in the `NOTICE_GIVEN` state — the tenant explicitly notified the
   * landlord they are moving out (`noticeDate` is set).
   */
  noticeGivenCount: number;

  /**
   * `ACTIVE` rentals whose contract `endDate` falls within the next 30 days
   * and that have not given notice yet. Derived from `endDate`, not a status.
   */
  expiringSoonCount: number;

  averageTerm: number;
  monthlyRevenue: string;
}
