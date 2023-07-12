import * as React from "react";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";

export default function CategoryContent({ onDataReceived, options }) {
  const [selectedIndex, setSelectedIndex] = React.useState(0);

  const handleCategoryClick = (index) => {
    setSelectedIndex(index);
    onDataReceived(options[index]);
  };

  return (
    <Box display="flex">
      {options.map((option, index) => (
        <Button
          key={option}
          onClick={() => handleCategoryClick(index)}
          variant={index === selectedIndex ? "contained" : "outlined"}
          sx={{
            marginRight: "8px",
            color: index === selectedIndex ? "white" : "#16687f",
            backgroundColor: index === selectedIndex ? "#16687f" : "transparent",
            border: "none",
            boxShadow: "none",
            "&:hover": {
              backgroundColor: index === selectedIndex ? "#16687f" : "#99c3d6",
            },
          }}
        >
          {option}
        </Button>
      ))}
    </Box>
  );
}
