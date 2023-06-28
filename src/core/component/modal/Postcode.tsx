import { Button } from "antd";
import { Address, useDaumPostcodePopup } from "react-daum-postcode";

type Props = {
  setAddress: (address: string) => void;
};

const Postcode: React.FC<Props> = ({ setAddress }) => {
  const open = useDaumPostcodePopup();

  const handleComplete = (data: Address) => {
    let fullAddress = data.address;
    let extraAddress = "";

    if (data.addressType === "R") {
      if (data.bname !== "") {
        extraAddress += data.bname;
      }
      if (data.buildingName !== "") {
        extraAddress +=
          extraAddress !== "" ? `, ${data.buildingName}` : data.buildingName;
      }
      fullAddress += extraAddress !== "" ? ` (${extraAddress})` : "";
    }

    setAddress(fullAddress);
  };

  const handleClick = () => {
    open({ onComplete: handleComplete });
  };

  return <Button onClick={handleClick}>찾기</Button>;
};

export default Postcode;
