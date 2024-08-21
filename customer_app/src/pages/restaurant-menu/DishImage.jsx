const DishImage = ({ item }) => {
  return (
    <div className="dish-image-container">
      {item?.backgrounds[0] && (
        <button className="cursor-pointer w-[118px] h-24 rounded-md">
          <img
            src={item?.backgrounds[0]}
            alt="menu-img"
            className="rounded-md w-[118px] h-24 object-cover"
          />
        </button>
      )}
    </div>
  );
};

export default DishImage;
