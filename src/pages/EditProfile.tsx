import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input, Textarea } from '../components/common/Input';
import Button from '../components/common/Button';
import { UserAvatar } from '../components/common/States';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { updateProfile } from '../services/userService';
import './EditProfile.css';

export default function EditProfile() {
  const { user, refreshUser } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [name, setName] = useState(user?.name ?? '');
  const username = user?.username ?? '';
  const [bio, setBio] = useState(user?.bio ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl ?? '');

  if (!user) return null;

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    updateProfile(user!.username, { name, bio, email, avatarUrl });
    refreshUser();
    showToast('Perfil atualizado com sucesso!');
    navigate(`/profile/${username}`);
  }

  return (
    <div className="edit-profile-page">
      <h1>Editar perfil</h1>
      <form onSubmit={handleSubmit} className="edit-profile-form">
        <div className="edit-profile-avatar-row">
          <UserAvatar src={avatarUrl || user.avatarUrl} alt={username} size={64} />
          <Input
            label="URL da foto de perfil"
            value={avatarUrl}
            onChange={(e) => setAvatarUrl(e.target.value)}
            placeholder="https://..."
          />
        </div>
        <Input label="Nome" value={name} onChange={(e) => setName(e.target.value)} />
        <Input
          label="Username"
          value={username}
          disabled
          title="A alteração de username ainda não está disponível."
        />
        <Textarea label="Bio" value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Fale um pouco sobre você" />
        <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />

        <div className="edit-profile-actions">
          <Button type="submit">Salvar alterações</Button>
          <Button type="button" variant="secondary" onClick={() => navigate(-1)}>
            Cancelar
          </Button>
        </div>
      </form>
    </div>
  );
}
