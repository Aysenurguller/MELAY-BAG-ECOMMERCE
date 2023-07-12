import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import Rating from "./Rating";
import Pagination from "./pagination";
import { useDispatch, useSelector } from "react-redux";
import { listProduct } from "../../Redux/Actions/ProductActions";
import Loading from "../LoadingError/Loading";
import Message from "../LoadingError/Error";
import CategoryContent from "./CategoryContent";
import { useState } from "react";

const ShopSection = (props) => {
  const { keyword, pagenumber, categoryBool } = props;
  const dispatch = useDispatch();

  const [childData, setChildData] = useState(null);
  const [price, setPrice] = useState(null);
  const handleDataFromChild = (data) => {
    setChildData(data);
  };

  const handlePrice = (price) => {
    setPrice(price);
  };

  const options1 = ["Any", "Man", "Woman"];
  const options2 = [
    "No Filter",
    "Price Ascending",
    "Price Descending",
    "Popularity",
  ];

  const productList = useSelector((state) => state.productList);
  const { loading, error, products, page, pages } = productList;
  let productsToUse = products;

  useEffect(() => {
    dispatch(listProduct(keyword, pagenumber));
  }, [dispatch, keyword, pagenumber]);

  const productsAscending = (products ?? []).sort((a, b) => a.price - b.price);
  const productsDescending = (products ?? []).sort((a, b) => b.price - a.price);
  const productsReviewDescending = (products ?? []).sort(
    (a, b) => b.numReviews - a.numReviews
  );
  if (price === "Price Ascending") {
    productsToUse = productsAscending;
  } else if (price === "Price Descending") {
    productsToUse = productsDescending;
  } else if (price === "Popularity") {
    productsToUse = productsReviewDescending;
  }
  return (
    <>
      <div className="container">
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <CategoryContent
            onDataReceived={handleDataFromChild}
            options={options1}
          ></CategoryContent>
          <CategoryContent
            onDataReceived={handlePrice}
            options={options2}
          ></CategoryContent>
        </div>

        <div className="section">
          <div className="row">
            <div className="col-lg-12 col-md-12 article">
              <div className="shopcontainer row">
                {loading ? (
                  <div className="mb-5">
                    <Loading />
                  </div>
                ) : error ? (
                  <Message variant="alert-danger">{error}</Message>
                ) : (
                  <>
                    {(productsToUse ?? []).map((product) => {
                      const oldPrice = product?.oldPrice ?? 0;
                      const discount = calculateDiscountRate(
                        oldPrice,
                        product.price
                      );

                      if (childData === "Any" || childData === null) {
                        return (
                          <div
                            className="shop col-lg-4 col-md-6 col-sm-6"
                            key={product._id}
                          >
                            <div className="border-product">
                              <Link to={`/products/${product._id}`}>
                                <div className="shopBack">
                                  <img src={product.image} alt={product.name} />
                                </div>
                              </Link>

                              <div className="shoptext">
                                <p>
                                  <Link to={`/products/${product._id}`}>
                                    {product.name}
                                  </Link>
                                </p>

                                <Rating
                                  value={product.rating}
                                  text={`${product.numReviews} reviews`}
                                />
                                <h5>{product.category}</h5>
                                <div
                                  style={{
                                    display: "flex",
                                    flexDirection: "row",
                                  }}
                                >
                                  {discount > 0 && (
                                    <h3
                                      style={{
                                        textDecoration: "line-through",
                                        paddingRight: "10px",
                                      }}
                                    >
                                      ${product.oldPrice}
                                    </h3>
                                  )}
                                  <h3>${product.price}</h3>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      } else if (product.category === childData) {
                        return (
                          <div
                            className="shop col-lg-4 col-md-6 col-sm-6"
                            key={product._id}
                          >
                            <div className="border-product">
                              <Link to={`/products/${product._id}`}>
                                <div className="shopBack">
                                  <img src={product.image} alt={product.name} />
                                </div>
                              </Link>

                              <div className="shoptext">
                                <p>
                                  <Link to={`/products/${product._id}`}>
                                    {product.name}
                                  </Link>
                                </p>

                                <Rating
                                  value={product.rating}
                                  text={`${product.numReviews} reviews`}
                                />
                                <h5>{product.category}</h5>
                                <div
                                  style={{
                                    display: "flex",
                                    flexDirection: "row",
                                  }}
                                >
                                  {discount > 0 && (
                                    <h3
                                      style={{
                                        textDecoration: "line-through",
                                        paddingRight: "10px",
                                      }}
                                    >
                                      ${product.oldPrice}
                                    </h3>
                                  )}
                                  <h3>${product.price}</h3>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      }
                    })}
                  </>
                )}

                {/* Pagination */}
                <Pagination
                  pages={pages}
                  page={page}
                  keyword={keyword ? keyword : ""}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ShopSection;

function calculateDiscountRate(oldPrice, price) {
  if (price >= oldPrice) {
    return 0;
  }

  var discountAmount = oldPrice - price;
  return (discountAmount / oldPrice) * 100;
}
