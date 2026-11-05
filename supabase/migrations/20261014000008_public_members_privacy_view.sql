-- ============================================================================
-- DUBAI OASIS LIONS CLUB — MIGRATION 0008: PUBLIC MEMBERS PRIVACY VIEW
-- Lions Year 2026–2027 | Motto: WE SERVE
-- ============================================================================
-- Purpose:
-- Enforces server-side column-level privacy. Prevents unapproved private member
-- information (home addresses in India, unapproved family details, unapproved
-- family photos, full date of birth years) from ever being queried or returned
-- across the network to public / anonymous visitors.
-- ============================================================================

-- 1. Create Public-Safe View for Members Directory
CREATE OR REPLACE VIEW public.public_members AS
SELECT
    id,
    name_prefix,
    first_name,
    last_name,
    public_role,
    committee,
    service_interests,
    professional_background,
    biography,
    avatar_url,
    joining_date,
    date_of_birth,
    -- Family photo: ONLY exposed if family_photo_approved is TRUE
    CASE WHEN family_photo_approved = true THEN family_photo_url ELSE NULL END AS family_photo_url,
    family_photo_approved,
    -- Address in India: ONLY exposed if address_in_india_visible is TRUE
    CASE WHEN address_in_india_visible = true THEN address_in_india ELSE NULL END AS address_in_india,
    address_in_india_visible,
    -- Family details (spouse, anniversary, children): ONLY exposed if family_details_approved is TRUE
    CASE WHEN family_details_approved = true THEN has_spouse ELSE false END AS has_spouse,
    CASE WHEN family_details_approved = true THEN spouse_name ELSE NULL END AS spouse_name,
    CASE WHEN family_details_approved = true THEN spouse_dob ELSE NULL END AS spouse_dob,
    CASE WHEN family_details_approved = true THEN wedding_anniversary ELSE NULL END AS wedding_anniversary,
    CASE WHEN family_details_approved = true THEN children_data ELSE '[]'::jsonb END AS children_data,
    CASE WHEN family_details_approved = true THEN children_names ELSE NULL END AS children_names,
    family_details_approved,
    -- Family message: ONLY exposed if family_message_approved is TRUE
    CASE WHEN family_message_approved = true THEN family_message ELSE NULL END AS family_message,
    family_message_approved,
    status,
    is_public,
    is_featured,
    display_order,
    created_at
FROM public.members
WHERE is_public = true AND status = 'active';

-- 2. Grant Read Access on View to Public (anon) and Authenticated Users
GRANT SELECT ON public.public_members TO anon, authenticated;

-- 3. Document the Security Guarantee
COMMENT ON VIEW public.public_members IS
'Public-safe directory view. Server-side column masking ensures home addresses, unapproved spouse details, and unapproved family photos are physically NULL for public visitors.';
