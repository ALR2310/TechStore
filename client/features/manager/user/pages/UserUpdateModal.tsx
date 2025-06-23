import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Modal from '~/components/Modal';
import { getUser, updateUser } from '../api/UserApi';
import Select from '~/components/Select';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import { toast } from '~/hooks/useToast';

interface UserUpdateModalProps {
  userId: string;
  modalRef?: React.Ref<HTMLDialogElement>;
}

export const UserUpdateModal = ({ userId, modalRef }: UserUpdateModalProps) => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [role, setRole] = useState('');
  const [status, setStatus] = useState('');
  const [gender, setGender] = useState('');
  const [dob, setDob] = useState('');
  const queryClient = useQueryClient();

  const { data } = useQuery({
    queryKey: ['user', userId],
    queryFn: async () => getUser({ id: userId ?? '' }),
  });

  useEffect(() => {
    if (data) {
      setFullName(data.FullName ?? '');
      setEmail(data.Email ?? '');
      setPhoneNumber(data.PhoneNumber ?? '');
      setRole(data.Role ?? '');
      setStatus(data.Status ?? '');
      setGender(data.Gender ?? '');
      setDob(dayjs(data.DoB).format('YYYY-MM-DD'));
    }
  }, [data]);

  const updateUserMutation = useMutation({
    mutationFn: () => updateUser({ id: userId, email, role, status, fullName, phoneNumber, dateOfBirth: dob, gender }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['users'],
      });
      toast({ type: 'success', message: 'Cập nhật người dùng thành công!' });
    },
  });

  return (
    <Modal
      title="Cập nhật người dùng"
      ref={modalRef}
      backdropClose={true}
      btnCancel={{
        text: 'Đóng',
        width: '110px',
      }}
      btnOk={{
        width: '110px',
        text: 'Cập nhật',
        color: 'success',
        onClick: () => updateUserMutation.mutate(),
      }}
    >
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-4">
          <p>Tên đăng nhập:</p>
          <label className="input">
            <input type="text" className="grow" readOnly value={data?.UserName ?? ''} />
          </label>
        </div>

        <div className="space-y-4">
          <p>Tên người dùng:</p>
          <label className="input">
            <input type="text" className="grow" value={fullName} onChange={(e) => setFullName(e.target.value)} />
          </label>
        </div>

        <div className="space-y-4">
          <p>Địa chỉ Email:</p>
          <label className="input">
            <input type="text" className="grow" value={email} onChange={(e) => setEmail(e.target.value)} />
          </label>
        </div>

        <div className="space-y-4">
          <p>Số điện thoại:</p>
          <label className="input">
            <input type="text" className="grow" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} />
          </label>
        </div>

        <div className="space-y-4">
          <p>Quyền/Vai trò:</p>
          <Select
            value={role}
            options={[
              { label: 'Quản trị viên', value: 'Admin' },
              { label: 'Người dùng', value: 'User' },
            ]}
            onChange={(value) => setRole(value)}
          />
        </div>

        <div className="space-y-4">
          <p>Trạng thái:</p>
          <Select
            value={status}
            options={[
              { label: 'Hoạt động', value: 'Active' },
              { label: 'Vô hiệu', value: 'Inactive' },
            ]}
            onChange={(value: string) => setStatus(value)}
          />
        </div>

        <div className="space-y-4">
          <p>Giới tính:</p>
          <Select
            value={gender}
            options={[
              { label: 'Nam', value: 'Nam' },
              { label: 'Nữ', value: 'Nữ' },
            ]}
            onChange={(value) => setGender(value)}
          />
        </div>

        <div className="space-y-4">
          <p>Ngày sinh:</p>
          <label className="input">
            <input type="date" className="grow" value={dob} onChange={(e) => setDob(e.target.value)} />
          </label>
        </div>
      </div>
    </Modal>
  );
};
