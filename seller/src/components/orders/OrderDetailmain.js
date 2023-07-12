import React, { useEffect } from "react";
import OrderDetailProducts from "./OrderDetailProducts";
import OrderDetailInfo from "./OrderDetailInfo";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  deliverOrder,
  getOrderDetails,
  putOrderStatusArchived,
  putOrderStatusRejected,
  getOrderInvoice,
} from "../../Redux/Actions/OrderActions";
import Loading from "../LoadingError/Loading";
import Message from "../LoadingError/Error";
import moment from "moment";

const OrderDetailmain = (props) => {
  const { orderId } = props;
  const dispatch = useDispatch();

  const orderDetails = useSelector((state) => state.orderDetails);
  const { loading, error, order } = orderDetails;

  const orderDeliver = useSelector((state) => state.orderDeliver);
  const { loading: loadingDelivered, success: successDelivered } = orderDeliver;

  useEffect(() => {
    dispatch(getOrderDetails(orderId));
  }, [dispatch, orderId, successDelivered]);

  const deliverHandler = () => {
    dispatch(deliverOrder(order));
  };

  const acceptReturnHandler = () => {
    dispatch(putOrderStatusArchived(order._id));
  };

  const rejectReturnHandler = () => {
    dispatch(putOrderStatusRejected(order._id));
  };

  const handleClickGetOrderInvoice = () => {
    dispatch(getOrderInvoice(order._id));
  };

  return (
    <section className="content-main">
      <div className="content-header">
        <Link to="/orders" className="btn btn-dark text-white">
          Back To Orders
        </Link>
      </div>

      {loading ? (
        <Loading />
      ) : error ? (
        <Message variant="alert-danger">{error}</Message>
      ) : (
        <div className="card">
          <header className="card-header p-3 Header-green">
            <div className="row align-items-center ">
              <div className="col-lg-6 col-md-6">
                <span>
                  <i className="far fa-calendar-alt mx-2"></i>
                  <b className="text-white">
                    {moment(order.createdAt).format("llll")}
                  </b>
                </span>
                <br />
                <small className="text-white mx-3 ">
                  Order ID: {order._id}
                </small>
              </div>
              <div className="col-lg-6 col-md-6 ms-auto d-flex justify-content-end align-items-center">
                <select
                  className="form-select d-inline-block"
                  style={{ maxWidth: "200px" }}
                >
                  <option>Change status</option>
                  <option>Awaiting payment</option>
                  <option>Confirmed</option>
                  <option>Shipped</option>
                  <option>Delivered</option>
                </select>
                <button
                  className="btn btn-success ms-2"
                  onClick={handleClickGetOrderInvoice}
                >
                  <i className="fas fa-download"></i>
                </button>
              </div>
            </div>
          </header>
          <div className="card-body">
            {/* Order info */}
            <OrderDetailInfo order={order} />

            <div className="row">
              <div className="col-lg-9">
                <div className="table-responsive">
                  <OrderDetailProducts order={order} loading={loading} />
                </div>
              </div>
              {/* Payment Info */}
            </div>
            {order?.isReturned && !order?.isArchived ? (
              <div className="row">
                <div className="col-lg-9">
                  <small className="mx-3 ">User Return Requested</small>
                  <button
                    className="badge rounded-pill alert alert-success text-success"
                    onClick={acceptReturnHandler}
                  >
                    Accept
                  </button>
                  <button
                    className="badge rounded-pill alert alert-danger text-danger"
                    onClick={rejectReturnHandler}
                  >
                    Reject
                  </button>
                </div>
              </div>
            ) : null}

            {order?.isReturned && order?.isArchived ? (
              <div className="row">
                <div className="col-lg-9">
                  <p className="mx-3 text-error" style={{ color: "red" }}>
                    Order returned!
                  </p>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </section>
  );
};

export default OrderDetailmain;
