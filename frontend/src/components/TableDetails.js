import "./TableDetails.css";
import { useLanguage } from "../contexts/LanguageContext";

function TableDetails({
  tableId,
  products = [],
  onAddProduct,
  onDeleteProduct,
}) {
  const { t } = useLanguage();

  const total = products.reduce(
    (sum, product) => sum + (product.price * product.quantity || 0),
    0
  );

  return (
    <div className="table-details">
      <div className="header-row">
        <h2>
          {t("products_for_table")} {tableId}
        </h2>
      </div>

      {!products.length ? (
        <p className="empty-message">{t("no_products_yet")}</p>
      ) : (
        <>
          <ul className="product-list">
            {products.map((product) => (
              <li key={product.id} className="product-item">
                <div className="item-row">
                  <span className="product-name">{product.name}</span>
                  <span className="product-qty">
                    {t("qty")}: {product.quantity}
                  </span>
                  <span className="product-price">
                    ${product.price * product.quantity}
                  </span>
                  <span>
                    <button
                      className="delete-btn-home"
                      onClick={() => onDeleteProduct(product.id)}
                    >
                      ❌
                    </button>
                  </span>
                </div>
              </li>
            ))}
          </ul>
          <div className="bottom-section">
            <div className="total-price">
              <strong>{t("price")}:</strong> ${total.toFixed(2)}
            </div>
            <button className="add-btn" onClick={onAddProduct}>
              ➕ {t("add_product")}
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default TableDetails;
