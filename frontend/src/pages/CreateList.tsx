import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { User as UserIcon, Users2 } from 'lucide-react';
import { Input, Textarea } from '../components/common/Input';
import Button from '../components/common/Button';
import { useToast } from '../context/ToastContext';
import { createList } from '../services/listService';
import type { ListType } from '../types/gamebox';
import './CreateList.css';

export default function CreateList() {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<ListType>('personal');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { showToast } = useToast();
  const navigate = useNavigate();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      setError('Dê um nome para a sua lista.');
      return;
    }
    setSubmitting(true);
    try {
      const list = await createList({ name: name.trim(), description: description.trim(), type });
      showToast('Lista criada com sucesso!');
      navigate(`/lists/${list.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar lista.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="create-list-page">
      <h1>Criar lista</h1>
      <form onSubmit={handleSubmit} className="create-list-form">
        <Input
          label="Nome"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ex: Jogos para zerar em 2026"
          error={error}
        />
        <Textarea
          label="Descrição"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Do que se trata essa lista?"
        />

        <label className="create-list-label">Tipo</label>
        <div className="create-list-types">
          <button
            type="button"
            className={`create-list-type ${type === 'personal' ? 'active' : ''}`}
            onClick={() => setType('personal')}
          >
            <UserIcon size={20} />
            <div>
              <strong>Pessoal</strong>
              <p>Somente você pode adicionar e avaliar jogos.</p>
            </div>
          </button>
          <button
            type="button"
            className={`create-list-type ${type === 'group' ? 'active' : ''}`}
            onClick={() => setType('group')}
          >
            <Users2 size={20} />
            <div>
              <strong>Grupo</strong>
              <p>Convide seus amigos e construam a lista juntos.</p>
            </div>
          </button>
        </div>

        <Button type="submit" fullWidth disabled={submitting}>
          Criar lista
        </Button>
      </form>
    </div>
  );
}
