import { Carousel, Col, Image } from "antd";

type Props = {
  data: {
    images: string[];
  };
};

const MyCarousel: React.FC<Props> = ({ data }) => {
  return (
    <Col style={{ maxWidth: 300, margin: "0 auto" }}>
      <Carousel>
        {data.images.map((s) => (
          <Image
            width={300}
            height={300}
            key={s}
            src={`${process.env.REACT_APP_IMAGE_BASE_URL}/${s}`}
            style={{ margin: "0 auto" }}
          />
        ))}
      </Carousel>
    </Col>
  );
};

export default MyCarousel;
