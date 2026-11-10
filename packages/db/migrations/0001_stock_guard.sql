-- Stock guard: decrement variant stock atomically when an order item is created.
-- If the variant has no enough stock, the whole D1 batch is aborted.
CREATE TRIGGER IF NOT EXISTS order_items_stock_guard
BEFORE INSERT ON order_items
BEGIN
  UPDATE variants
  SET stock = stock - NEW.quantity
  WHERE id = NEW.variant_id AND stock >= NEW.quantity;
  SELECT CASE WHEN changes() = 0 THEN RAISE(ABORT, 'INSUFFICIENT_STOCK') END;
END;
