

import { supabase } from "@/lib/supabaseClient";
import Swal, { type SweetAlertIcon, type SweetAlertPosition } from "sweetalert2";

// 기본 토스트
export function toast({
  title,
  icon = 'success',
  position = 'center',
  timer = 1500,
  showConfirmButton = false,
} : {
  title:string;
  icon?: SweetAlertIcon;
  position?: SweetAlertPosition;
  timer?: number;
  showConfirmButton?: boolean;
}) {
  return Swal.fire({
    toast:true,
    position,
    title,
    icon,
    iconColor:"#8ACCD5",
    timer,
    showConfirmButton,
    timerProgressBar:true,
  });
}

// 일반 알림(모달)
export function notify({
  title,
  text,
  icon = 'info',
  confirmButtonText = '확인',
}: {
  title:string;
  text?:string;
  icon?:SweetAlertIcon;
  confirmButtonText?:string;
}) {
  return Swal.fire({
    title,
    text,
    icon,
    iconColor:"#8ACCD5",
    confirmButtonText,
  });
}

// 에러 알림(모달)
export function errorAlert({
  title = '오류',
  text = '다시 시도해주세요.',
}: {
  title?: string;
  text?: string;
}) {
  return Swal.fire({
    icon:'error',
    iconColor:"#8ACCD5",
    title,
    text,
  });
}

// 확인(confirm) 모달
export async function confirmDialog({
  title = '정말 진행하시겠습니까?',
  text,
  confirmButtonText = '확인',
  cancelButtonText = '취소',
  icon = 'warning',
}: {
  title?:string;
  text?:string;
  confirmButtonText?:string;
  cancelButtonText?:string;
  icon?:SweetAlertIcon;
}): Promise<boolean> {
  const result = await Swal.fire({
    title,
    text,
    icon,
    iconColor:"#8ACCD5",
    showCancelButton:true,
    confirmButtonText,
    cancelButtonText,
  });
  return result.isConfirmed;
}



// 로그아웃 성공
export async function LogoutAlert(navigate:any) {

  const result = await Swal.fire({
    title:'정말 로그아웃 하시겠습니까?',
    icon:'warning',
    iconColor: "#8ACCD5",
    showCancelButton:true,
    confirmButtonText:'로그아웃',
    cancelButtonText:'취소',
  });

  if(!result.isConfirmed) return;

  const {error} = await supabase.auth.signOut();
  if(error) {
    await Swal.fire({
      icon:'error',
      iconColor: "#8ACCD5",
      title:'로그아웃 실패',
      text:'다시 시도해주세요',
    });
    return;
  }

  Swal.fire({
    toast:true,
    position:'top-end',
    icon:'info',
    iconColor: "#8ACCD5",
    title:'로그아웃 완료!🖐️',
    showConfirmButton:false,
    timer:1800,
    timerProgressBar:true,
  });

  navigate('/', {replace:true});


}


