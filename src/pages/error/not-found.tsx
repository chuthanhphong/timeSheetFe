import React from "react";
import { Button, Result } from "antd";
import { useNavigate } from "react-router-dom";

const Error404 = () => {
  const navigate = useNavigate();
  return (
    <Result
      className="page-result"
      status="404"
      title="404 - Not Found"
      subTitle="Sorry, the page you visited does not exist."
      extra={
        <Button type="primary" onClick={() => navigate("/", { replace: true })}>
          Back Home
        </Button>
      }
    />
  );
};

export default Error404;
