-- Aggregated views and helper functions for seof web application.
-- Run this file against the Supabase project's Postgres database.

-- 1. 리뷰 + 건물 메타데이터 뷰
create or replace view public.reviews_with_room_summary as
select
  r.id,
  r.created_at,
  r.room_id,
  rm.name as room_name,
  rm.address as room_address,
  rm.postcode as room_postcode,
  r.score,
  r.rent_type,
  case
    when r.rent_type = '월세' then coalesce(r.rent, 0) * 12
    when r.rent_type = '전세' then coalesce(r.deposit, 0)
    when r.rent_type = '사글세' then coalesce(r.rent, 0)
    else null
  end as annual_rent,
  r.deposit,
  r.rent,
  r.move_at,
  r.floor,
  r.context
from public.reviews r
  join public.rooms rm on rm.id = r.room_id
where r.deleted_at is null;

comment on view public.reviews_with_room_summary is
  '리뷰 데이터를 건물 메타 정보와 결합하고 연간 임대료를 계산한 뷰입니다.';

-- 2. 건물별 리뷰 통계 뷰
create or replace view public.room_review_stats as
select
  rm.id as room_id,
  rm.name as room_name,
  rm.address as room_address,
  rm.postcode as room_postcode,
  round(avg(r.score)::numeric, 2) as average_score,
  count(r.*) as review_count,
  round(avg(
    case
      when r.rent_type = '월세' then coalesce(r.rent, 0) * 12
      when r.rent_type = '전세' then coalesce(r.deposit, 0)
      when r.rent_type = '사글세' then coalesce(r.rent, 0)
      else null
    end
  )::numeric, 2) as average_annual_rent
from public.rooms rm
  left join public.reviews r on r.room_id = rm.id and r.deleted_at is null
group by rm.id, rm.name, rm.address, rm.postcode;

comment on view public.room_review_stats is
  '건물(방) 단위로 평균 평점, 리뷰 수, 평균 연 임대료를 제공하는 통계 뷰입니다.';

-- 3. 선택 사항: 검색 최적화를 위한 인덱스
create index if not exists idx_reviews_room_name_trgm
  on public.rooms using gin (name gin_trgm_ops);

create index if not exists idx_reviews_created_at
  on public.reviews (created_at desc)
  where deleted_at is null;

create index if not exists idx_reviews_rent_type
  on public.reviews (rent_type)
  where deleted_at is null;
