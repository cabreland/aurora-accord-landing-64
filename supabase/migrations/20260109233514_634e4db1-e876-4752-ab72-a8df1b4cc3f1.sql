-- Fix function search_path for security
CREATE OR REPLACE FUNCTION create_data_room_from_template(
  p_deal_id UUID,
  p_template_name TEXT
)
RETURNS void AS $$
DECLARE
  v_template JSONB;
  v_category JSONB;
  v_folder JSONB;
  v_category_id UUID;
BEGIN
  -- Get template
  SELECT folder_structure INTO v_template
  FROM public.data_room_templates
  WHERE name = p_template_name AND is_active = true;

  IF v_template IS NULL THEN
    RAISE EXCEPTION 'Template not found: %', p_template_name;
  END IF;

  -- Loop through categories
  FOR v_category IN SELECT * FROM jsonb_array_elements(v_template->'categories')
  LOOP
    -- Get category ID
    SELECT id INTO v_category_id
    FROM public.data_room_categories
    WHERE index_number = (v_category->>'categoryIndex')::INTEGER;

    IF v_category_id IS NULL THEN
      CONTINUE;
    END IF;

    -- Loop through folders in category
    FOR v_folder IN SELECT * FROM jsonb_array_elements(v_category->'folders')
    LOOP
      -- Insert folder
      INSERT INTO public.data_room_folders (
        deal_id,
        category_id,
        name,
        index_number,
        is_required,
        sort_order
      ) VALUES (
        p_deal_id,
        v_category_id,
        v_folder->>'name',
        v_folder->>'index',
        COALESCE((v_folder->>'required')::BOOLEAN, false),
        CAST(SPLIT_PART(v_folder->>'index', '.', 2) AS INTEGER)
      );
    END LOOP;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;