// InfoWindow 스타일
export const addInfoWindowStyles = () => {
  const existingStyle = document.getElementById("custom-infowindow-style");
  if (existingStyle) return;

  const style = document.createElement("style");
  style.id = "custom-infowindow-style";
  style.textContent = `
    /* InfoWindow 전체 컨테이너 */
    .gm-style .gm-style-iw-c {
      border-radius: 12px;
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
      overflow: hidden;
    }

    /* InfoWindow 내용 영역 */
    .gm-style .gm-style-iw-d {
      overflow: hidden;
    }

    /* 닫기 버튼 조정 */
    .gm-style .gm-style-iw-t::after {
      width: 14px;
      height: 14px;
      right: 8px;
      top: 8px;
      opacity: 0.7;
      transition: opacity 0.2s ease;
    }

    .gm-style .gm-style-iw-t:hover::after {
      opacity: 1;
    }
  `;

  document.head.appendChild(style);
};
