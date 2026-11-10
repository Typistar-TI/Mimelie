-- Seed demonstrativo da Mimelie. Idempotente: pode rodar mais de uma vez.
INSERT OR IGNORE INTO stores (id, name, slug, domain, is_active, created_at, updated_at) VALUES
  ('11111111-1111-4111-8111-111111111111', 'Amazon', 'amazon', 'amazon.com.br', 1, (unixepoch() * 1000), (unixepoch() * 1000)),
  ('22222222-2222-4222-8222-222222222222', 'Shopee', 'shopee', 'shopee.com.br', 1, (unixepoch() * 1000), (unixepoch() * 1000)),
  ('33333333-3333-4333-8333-333333333333', 'Sephora', 'sephora', 'sephora.com.br', 1, (unixepoch() * 1000), (unixepoch() * 1000));

INSERT OR IGNORE INTO offer_categories (id, name, slug, description, is_active, created_at, updated_at) VALUES
  ('44444444-4444-4444-8444-444444444444', 'Cílios', 'cilios', 'Cílios, extensões e acessórios.', 1, (unixepoch() * 1000), (unixepoch() * 1000)),
  ('55555555-5555-4555-8555-555555555555', 'Maquiagem', 'maquiagem', 'Base, blush, batom e olhos.', 1, (unixepoch() * 1000), (unixepoch() * 1000)),
  ('66666666-6666-4666-8666-666666666666', 'Skincare', 'skincare', 'Limpeza, hidratação e proteção.', 1, (unixepoch() * 1000), (unixepoch() * 1000));

INSERT OR IGNORE INTO products (id, slug, name, short_description, description, status, category, published_at, created_at, updated_at) VALUES
  ('a0000000-0000-4000-8000-000000000001', 'curva-de-caramelo', 'Curva de Caramelo', 'Leve, macio e desenhado para acompanhar o seu olhar.', '[]', 'ACTIVE', 'Cílios', (unixepoch() * 1000), (unixepoch() * 1000), (unixepoch() * 1000)),
  ('a0000000-0000-4000-8000-000000000002', 'nuvem-de-cacau', 'Nuvem de Cacau', 'Volume delicado com fios que desaparecem na linha dos olhos.', '[]', 'ACTIVE', 'Cílios', (unixepoch() * 1000), (unixepoch() * 1000), (unixepoch() * 1000)),
  ('a0000000-0000-4000-8000-000000000003', 'laco-de-rosas', 'Laço de Rosas', 'Uma curva aberta e romântica para ocasiões especiais.', '[]', 'ACTIVE', 'Cílios', (unixepoch() * 1000), (unixepoch() * 1000), (unixepoch() * 1000));

INSERT OR IGNORE INTO variants (id, product_id, sku, name, attributes, price_cents, stock, safety_stock, weight_grams, active, created_at, updated_at) VALUES
  ('b0000000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-000000000001', 'CIL-CURVA-01', 'Natural', '{}', 4990, 50, 1, 30, 1, (unixepoch() * 1000), (unixepoch() * 1000)),
  ('b0000000-0000-4000-8000-000000000002', 'a0000000-0000-4000-8000-000000000002', 'CIL-NUVEM-01', 'Volume leve', '{}', 5590, 50, 1, 30, 1, (unixepoch() * 1000), (unixepoch() * 1000)),
  ('b0000000-0000-4000-8000-000000000003', 'a0000000-0000-4000-8000-000000000003', 'CIL-LACO-01', 'Curva aberta', '{}', 5990, 50, 1, 30, 1, (unixepoch() * 1000), (unixepoch() * 1000));

INSERT OR IGNORE INTO product_images (id, product_id, key, alt, position) VALUES
  ('c0000000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-000000000001', '/media/hero/curva-caramelo.webp', 'Curva de Caramelo', 0),
  ('c0000000-0000-4000-8000-000000000002', 'a0000000-0000-4000-8000-000000000002', '/media/hero/nuvem-cacau.webp', 'Nuvem de Cacau', 0),
  ('c0000000-0000-4000-8000-000000000003', 'a0000000-0000-4000-8000-000000000003', '/media/hero/laco-rosas.webp', 'Laço de Rosas', 0);

INSERT OR IGNORE INTO offers (id, slug, title, description, image_url, store_id, category_id, current_price_cents, original_price_cents, discount_percent, coupon_code, affiliate_url, status, verified_at, published_at, created_at, updated_at) VALUES
  ('d0000000-0000-4000-8000-000000000001', 'mascara-de-cilios-volume-amazon', 'Máscara de cílios volume extremo com efeito alongador', 'Máscara à prova d''água com escova curva e acabamento natural. Oferta conferida pela curadoria da Mimelie.', NULL, '11111111-1111-4111-8111-111111111111', '44444444-4444-4444-8444-444444444444', 3990, 5990, 33, 'MIMELIE10', 'https://example.com/oferta/mascara-cilios', 'PUBLISHED', (unixepoch() * 1000), (unixepoch() * 1000), (unixepoch() * 1000), (unixepoch() * 1000)),
  ('d0000000-0000-4000-8000-000000000002', 'blush-liquido-sephora', 'Blush líquido de acabamento acetinado', 'Textura leve, fácil de esfumar e com cor construível. Ideal para o dia a dia.', NULL, '33333333-3333-4333-8333-333333333333', '55555555-5555-4555-8555-555555555555', 8990, 11900, 24, NULL, 'https://example.com/oferta/blush-liquido', 'PUBLISHED', (unixepoch() * 1000), (unixepoch() * 1000), (unixepoch() * 1000), (unixepoch() * 1000)),
  ('d0000000-0000-4000-8000-000000000003', 'protetor-solar-shopee', 'Protetor solar facial FPS 60 com cor', 'Proteção alta com acabamento leve e toque seco. Resenha e preço conferidos.', NULL, '22222222-2222-4222-8222-222222222222', '66666666-6666-4666-8666-666666666666', 5490, 7990, 31, 'SOL10', 'https://example.com/oferta/protetor-solar', 'PUBLISHED', (unixepoch() * 1000), (unixepoch() * 1000), (unixepoch() * 1000), (unixepoch() * 1000));

INSERT OR IGNORE INTO content_posts (id, slug, title, excerpt, content, status, seo_title, seo_description, published_at, created_at, updated_at) VALUES
  ('e0000000-0000-4000-8000-000000000001', 'como-escolher-cilios', 'Como escolher o cílio que combina com você', 'Um guia curto para encontrar a curva, o volume e o conforto certos para o seu olho.', '[]', 'PUBLISHED', 'Como escolher cílios — Mimelie', 'Curva, volume e conforto: um guia para escolher o cílio ideal.', (unixepoch() * 1000), (unixepoch() * 1000), (unixepoch() * 1000));

INSERT OR IGNORE INTO shipping_zones (id, name, cep_start, cep_end, price_cents, deadline_days, free_above_cents, active, created_at, updated_at) VALUES
  ('f0000000-0000-4000-8000-000000000001', 'Sudeste', '01000000', '39999999', 1990, 5, 15000, 1, (unixepoch() * 1000), (unixepoch() * 1000)),
  ('f0000000-0000-4000-8000-000000000002', 'Sul', '80000000', '99999999', 2490, 7, 15000, 1, (unixepoch() * 1000), (unixepoch() * 1000)),
  ('f0000000-0000-4000-8000-000000000003', 'Centro-Oeste', '70000000', '79999999', 2790, 8, 15000, 1, (unixepoch() * 1000), (unixepoch() * 1000)),
  ('f0000000-0000-4000-8000-000000000004', 'Nordeste', '40000000', '65999999', 3290, 10, 15000, 1, (unixepoch() * 1000), (unixepoch() * 1000)),
  ('f0000000-0000-4000-8000-000000000005', 'Norte', '66000000', '69999999', 3990, 12, 15000, 1, (unixepoch() * 1000), (unixepoch() * 1000));

INSERT OR IGNORE INTO settings (key, value, updated_at) VALUES
  ('automation.paused', 'false', (unixepoch() * 1000));
