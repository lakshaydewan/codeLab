'use server'

import { prisma } from '@/lib/prisma';
import { revalidatePath } from "next/cache";
import { TemplateType, Privacy } from "@/lib/types/types";

export async function createTemplate(userId: string, name: string, type: TemplateType, privacy: Privacy) {
  
  const template = await prisma.template.create({
    data: {
      userId,
      name,
      type,
      privacy,
      content: type === "javascript" ? "console.log('Hello, WebContainers!');" : "print('Hello WebContainers!')",
    },
  });
  revalidatePath(`/main`)
  return template;
}

export async function getTemplates(userId: string) {

  const templates = await prisma.template.findMany({
    where: {
      userId,
    },
  });

  return templates;
}

export async function getTemplate(id: string) {
  const template = await prisma.template.findUnique({
    where: {
      id,
    },
  });

  return template;
}

export async function saveTemplate(id: string, content: string) {
  const savedTemplate = await prisma.template.update({
    where: {
      id,
    },
    data: {
      content,
    },
  });

  return savedTemplate;
}

export async function deleteTemplate(id: string) {
  const deletedTemplate = await prisma.template.delete({
    where: {
      id,
    },
  });
  revalidatePath(`/main`, 'layout')
  revalidatePath(`/main/templates`, 'page')
  return deletedTemplate;
}

