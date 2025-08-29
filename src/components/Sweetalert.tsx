

import { supabase } from "@/lib/supabaseClient";
import Swal from "sweetalert2";

// 로그인 성공
export function LoginAlert(message:string, icon:'success' | 'error') {
  Swal.fire({
    toast:true,
    position:'top-end',
    title:message,
    icon,
    iconColor: "#8ACCD5",
    showConfirmButton:false,
    timer:1800,
    timerProgressBar:true,
  });
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

// 그룹카드 생성
export function GroupAddAlert() {
  Swal.fire({
    toast:true,
    position:'top',
    icon:'success',
    iconColor: "#8ACCD5",
    title:'새 그룹 추가 완료!🌟',
    showConfirmButton:false,
    timer:1500,
    timerProgressBar:true,
  });
}
