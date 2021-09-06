import { PageHeader } from "antd";
import React from "react";

// displays a page header

export default function Header() {
  return (
    <a href="/home" target="_blank" rel="noopener noreferrer">
      <PageHeader
        title="Avaatar"
        subTitle=" An NFT Marketplace"
        style={{ cursor: "pointer" }}
      />
    </a>
  );
}
