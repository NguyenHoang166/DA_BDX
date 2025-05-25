import React, { useEffect, useState } from "react";
import axios from "axios";
import { useSearchParams, useNavigate } from "react-router-dom";
import emailjs from "emailjs-com";
import { QRCodeCanvas } from "qrcode.react";
import "./PaymentResultPage.css";

const PaymentResultPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState("");
  const [isProcessing, setIsProcessing] = useState(true);
  const [orderDetails, setOrderDetails] = useState(null);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  const sendOrderDetailsEmail = (orderDetails) => {
    const templateParams = {
      name: orderDetails.customerInfo.name,
      phone: orderDetails.customerInfo.phone,
      email: orderDetails.customerInfo.email,
      licensePlate: orderDetails.customerInfo.licensePlate,
      parkingLot: orderDetails.parkingLot,
      positions: orderDetails.positions.join(", "),
      vehicleType: orderDetails.vehicleType,
      startDate: orderDetails.startDate,
      endDate: orderDetails.endDate,
      duration: orderDetails.duration,
      total: orderDetails.total.toLocaleString(),
      paymentMethod: orderDetails.paymentMethod,
      qrCode: orderDetails.qrCode,
      to_email: orderDetails.customerInfo.email,
    };

    emailjs
      .send(
        "service_gn0x2u3",
        "template_27s5kyo",
        templateParams,
        "m_sqSMomHJTVzrxlP"
      )
      .then(
        (response) => {
          console.log("Email sent successfully!", response.status, response.text);
        },
        (error) => {
          console.error("Failed to send email:", error);
        }
      );
  };

  useEffect(() => {
    const handlePaymentConfirmation = async () => {
      try {
        const requiredParams = [
          "vnp_TxnRef",
          "vnp_ResponseCode",
          "vnp_TransactionStatus",
          "vnp_Amount",
          "vnp_PayDate",
        ];
        const hasVNPayParams = requiredParams.every((param) =>
          searchParams.has(param)
        );

        let parsedData = null;
        const storedData = localStorage.getItem("paymentData");
        if (storedData) {
          try {
            parsedData = JSON.parse(storedData);
          } catch (parseError) {
            console.error("Error parsing localStorage data:", parseError);
            setErrorMessage("Dữ liệu đơn hàng không hợp lệ. Vui lòng thử lại.");
            setIsProcessing(false);
            return;
          }
        }

        if (hasVNPayParams) {
          const response = await axios.get(
            "http://localhost:5000/api/payment/check-payment-vnpay",
            {
              params: Object.fromEntries(searchParams),
              timeout: 15000,
            }
          );

          if (response.data.status === "success") {
            if (!parsedData) {
              setErrorMessage(
                "Không tìm thấy thông tin đơn hàng. Vui lòng thử lại."
              );
              setIsProcessing(false);
              return;
            }

            const duration = Math.ceil(
              (new Date(parsedData.endDate) - new Date(parsedData.startDate)) /
                (1000 * 60 * 60)
            );
            const newOrder = {
              id: parsedData.orderId.split("_")[1],
              customerInfo: { ...parsedData.customerInfo },
              parkingLot: parsedData.selectedLotForBooking.name,
              positions: parsedData.selectedPositions,
              vehicleType: parsedData.selectedVehicleType,
              startDate: new Date(parsedData.startDate).toLocaleString("vi-VN", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
                hour12: false,
              }),
              endDate: new Date(parsedData.endDate).toLocaleString("vi-VN", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
                hour12: false,
              }),
              duration,
              total:
                parsedData.selectedLotForBooking.price *
                duration *
                parsedData.selectedPositions.length,
              paymentMethod: "vnpay",
              qrCode: "http://192.168.1.195/enter",
            };

            setOrderDetails(newOrder);
            sendOrderDetailsEmail(newOrder);
            localStorage.removeItem("paymentData");

            setIsProcessing(false);
            setShowSuccessMessage(true);
            setTimeout(() => setShowSuccessMessage(false), 2000);
            alert(
              `Thanh toán thành công! Hóa đơn đã được gửi đến email: ${parsedData.customerInfo.email}`
            );
          } else {
            const failMessage =
              response.data.message || "Thanh toán không thành công.";
            setErrorMessage(`Thanh toán thất bại: ${failMessage}`);
            setIsProcessing(false);
          }
        } else if (parsedData && parsedData.paymentMethod === "cash") {
          const duration = Math.ceil(
            (new Date(parsedData.endDate) - new Date(parsedData.startDate)) /
              (1000 * 60 * 60)
          );
          const newOrder = {
            id: parsedData.orderId.split("_")[1],
            customerInfo: { ...parsedData.customerInfo },
            parkingLot: parsedData.selectedLotForBooking.name,
            positions: parsedData.selectedPositions,
            vehicleType: parsedData.selectedVehicleType,
            startDate: new Date(parsedData.startDate).toLocaleString("vi-VN", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
              hour12: false,
            }),
            endDate: new Date(parsedData.endDate).toLocaleString("vi-VN", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
              hour12: false,
            }),
            duration,
            total:
              parsedData.selectedLotForBooking.price *
              duration *
              parsedData.selectedPositions.length,
            paymentMethod: "cash",
            qrCode: "http://192.168.1.195/enter",
          };

          setOrderDetails(newOrder);
          sendOrderDetailsEmail(newOrder);
          localStorage.removeItem("paymentData");

          setIsProcessing(false);
          setShowSuccessMessage(true);
          setTimeout(() => setShowSuccessMessage(false), 2000);
          alert(
            `Đặt xe thành công! Hóa đơn đã được gửi đến email: ${parsedData.customerInfo.email}`
          );
        } else {
          setErrorMessage("Không tìm thấy thông tin thanh toán hoặc đơn hàng.");
          setIsProcessing(false);
        }
      } catch (error) {
        console.error("Error checking payment status:", error);
        const errorMsg = `Lỗi khi kiểm tra trạng thái thanh toán: ${
          error.response?.data?.message || error.message
        }`;
        setErrorMessage(errorMsg);
        setIsProcessing(false);
      }
    };

    handlePaymentConfirmation();
  }, [searchParams, navigate]);

  return (
    <div className="payment-result-page">
      <h1>
        {isProcessing
          ? "Đang xử lý thanh toán..."
          : errorMessage
          ? "❌ Thanh toán thất bại"
          : ""}
      </h1>
      {isProcessing && <div className="spinner"></div>}
      {errorMessage && <p className="error-message">{errorMessage}</p>}
      {!isProcessing && !errorMessage && orderDetails && (
        <>
          {showSuccessMessage && (
            <p className="success-message">
              Cảm ơn bạn đã thanh toán! Vui lòng bấm "Đóng" để quay lại trang chính.
            </p>
          )}
          <div className="card">
            <div className="order-details-section">
              <h2>Chi tiết đơn hàng</h2>

              <div className="booking-details">
                <h3>Thông tin khách hàng</h3>
                <div className="detail-row">
                  <span>ID tài khoản:</span>
                  <span>{orderDetails.id}</span>
                </div>
                <div className="detail-row">
                  <span>Họ và tên:</span>
                  <span>{orderDetails.customerInfo.name}</span>
                </div>
                <div className="detail-row">
                  <span>Số điện thoại:</span>
                  <span>{orderDetails.customerInfo.phone}</span>
                </div>
                <div className="detail-row">
                  <span>Email:</span>
                  <span>{orderDetails.customerInfo.email}</span>
                </div>
                <div className="detail-row">
                  <span>Biển số xe:</span>
                  <span>{orderDetails.customerInfo.licensePlate}</span>
                </div>
              </div>

              <div className="booking-details">
                <h3>Thông tin đặt xe</h3>
                <div className="detail-row">
                  <span>Bãi xe:</span>
                  <span>{orderDetails.parkingLot}</span>
                </div>
                <div className="detail-row">
                  <span>Vị trí:</span>
                  <span>{orderDetails.positions.join(", ")}</span>
                </div>
                <div className="detail-row">
                  <span>Loại xe:</span>
                  <span>
                    {orderDetails.vehicleType === "motorcycle"
                      ? "Xe máy"
                      : orderDetails.vehicleType === "car"
                      ? "Ô tô"
                      : "Xe tải"}
                  </span>
                </div>
                <div className="detail-row">
                  <span>Thời gian bắt đầu:</span>
                  <span>{orderDetails.startDate}</span>
                </div>
                <div className="detail-row">
                  <span>Thời gian kết thúc:</span>
                  <span>{orderDetails.endDate}</span>
                </div>
                <div className="detail-row">
                  <span>Thời gian thuê:</span>
                  <span>{orderDetails.duration} giờ</span>
                </div>
                <div className="detail-row total">
                  <span>Tổng cộng:</span>
                  <span>{orderDetails.total.toLocaleString()} VND</span>
                </div>
              </div>

              <div className="booking-details">
                <h3>Phương thức thanh toán</h3>
                <div className="detail-row">
                  <span>Phương thức:</span>
                  <span>
                    {orderDetails.paymentMethod === "vnpay" ? "VNPay" : "Tiền mặt"}
                  </span>
                </div>
              </div>

              <div className="booking-details">
                <h3>Mã QR để mở khóa cổng</h3>
                <div className="detail-row">
                  <span>Mã QR:</span>            
                </div>
                {orderDetails.qrCode && (
                  <div className="qr-code-container">
                    <QRCodeCanvas value={orderDetails.qrCode} size={128} />
                    <p>Quét mã QR này để mở khóa cổng</p>
                  </div>
                )}
              </div>
            </div>
            <div className="button-group">
              <button
                className="close-button"
                onClick={() => navigate("/parking-selection")}
              >
                Đóng
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default PaymentResultPage;