// code copied from T11
import { useEffect, useState } from "react";
import "./main.css";
import { Link, useNavigate } from "react-router-dom";

function Success() {
    const navigate = useNavigate();
    const [ countdown, setCountdown ] = useState(3);

    useEffect(() => {
        if (countdown <= 0) {
            navigate("/");
        }
        else {
            setTimeout(() => setCountdown(countdown - 1), 1000);
        }
    }, [countdown]);


    return <>
        <h3>Success!</h3>
        <p>You will be redirected to the home page in {countdown} seconds.</p>
        <div className="row">
            <Link to="/">Home</Link>
        </div>
    </>;
}

export default Success;
